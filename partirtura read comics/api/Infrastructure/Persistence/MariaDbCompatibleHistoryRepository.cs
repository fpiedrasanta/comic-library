using System.Data.Common;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Infrastructure.Persistence;

/// <summary>
/// Historial de migraciones con un lock de base de datos compatible con MariaDB.
/// </summary>
/// <remarks>
/// El proveedor oficial <c>MySql.EntityFrameworkCore</c> (Oracle) emite
/// <c>SELECT GET_LOCK('__EFMigrationsLock', -1);</c> para adquirir el lock de migraciones.
/// MySQL acepta -1 como "esperar indefinidamente", pero MariaDB lo rechaza con el warning 1411
/// ("Incorrect timeout value: '-1' for function get_lock") y devuelve NULL. El proveedor castea
/// ese NULL a <see cref="long"/> y revienta con
/// <c>InvalidCastException: Unable to cast object of type 'System.DBNull' to type 'System.Int64'</c>.
///
/// Esta implementación reproduce el resto del comportamiento del proveedor (mismos scripts DDL)
/// pero usa un timeout con signo positivo, que es válido en ambos motores.
/// </remarks>
public class MariaDbCompatibleHistoryRepository : HistoryRepository
{
    private const string LockName = "__EFMigrationsLock";
    private const int LockTimeoutSeconds = 60;

    public MariaDbCompatibleHistoryRepository(HistoryRepositoryDependencies dependencies)
        : base(dependencies)
    {
    }

    public override LockReleaseBehavior LockReleaseBehavior => LockReleaseBehavior.Connection;

    protected override bool InterpretExistsResult(object? value)
        => value is not null and not DBNull && Convert.ToInt64(value) == 1;

    protected override string ExistsSql =>
        $"SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='{Dependencies.Connection.DbConnection.Database}' AND TABLE_NAME='{TableName}';";

    protected override string GetAppliedMigrationsSql =>
        $"SELECT `{MigrationIdColumnName}`, `{ProductVersionColumnName}` FROM `{TableName}` ORDER BY `{MigrationIdColumnName}`;";

    public override string GetCreateIfNotExistsScript() =>
        $"CREATE TABLE IF NOT EXISTS `{TableName}` (" +
        $"`{MigrationIdColumnName}` varchar(150) NOT NULL, " +
        $"`{ProductVersionColumnName}` varchar(32) NOT NULL, " +
        $"PRIMARY KEY (`{MigrationIdColumnName}`));";

    public override string GetBeginIfNotExistsScript(string migrationId) =>
        $"IF NOT EXISTS(SELECT * FROM `{TableName}` WHERE `{MigrationIdColumnName}` = '{migrationId}')\nBEGIN\n";

    public override string GetBeginIfExistsScript(string migrationId) =>
        $"IF EXISTS(SELECT * FROM `{TableName}` WHERE `{MigrationIdColumnName}` = '{migrationId}')\nBEGIN\n";

    public override string GetEndIfScript() => "END;\n";

    public override IMigrationsDatabaseLock AcquireDatabaseLock()
    {
        if (!IsLockAcquired(ExecuteScalar($"SELECT GET_LOCK('{LockName}', {LockTimeoutSeconds});")))
        {
            throw new InvalidOperationException(
                $"No se pudo obtener el lock de migraciones '{LockName}' dentro de {LockTimeoutSeconds} segundos. " +
                "Lo más probable es que otra instancia de la aplicación esté aplicando migraciones en este momento.");
        }

        return new MigrationsLockHandle(this, ReleaseLock);
    }

    public override async Task<IMigrationsDatabaseLock> AcquireDatabaseLockAsync(CancellationToken cancellationToken)
    {
        var result = await ExecuteScalarAsync($"SELECT GET_LOCK('{LockName}', {LockTimeoutSeconds});", cancellationToken)
            .ConfigureAwait(false);

        if (!IsLockAcquired(result))
        {
            throw new InvalidOperationException(
                $"No se pudo obtener el lock de migraciones '{LockName}' dentro de {LockTimeoutSeconds} segundos. " +
                "Lo más probable es que otra instancia de la aplicación esté aplicando migraciones en este momento.");
        }

        return new MigrationsLockHandle(this, ReleaseLock);
    }

    private void ReleaseLock()
    {
        try
        {
            ExecuteScalar($"SELECT RELEASE_LOCK('{LockName}');");
        }
        catch (DbException)
        {
            // La sesión ya no existe: el servidor libera el lock al cerrarse la conexión.
        }
    }

    private object? ExecuteScalar(string sql)
    {
        var connection = Dependencies.Connection;
        connection.Open(false);

        using var command = connection.DbConnection.CreateCommand();
        command.CommandText = sql;
        return command.ExecuteScalar();
    }

    private async Task<object?> ExecuteScalarAsync(string sql, CancellationToken cancellationToken)
    {
        var connection = Dependencies.Connection;
        await connection.OpenAsync(cancellationToken, false).ConfigureAwait(false);

        await using var command = connection.DbConnection.CreateCommand();
        command.CommandText = sql;
        return await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
    }

    private static bool IsLockAcquired(object? result)
        => result is not null and not DBNull && Convert.ToInt64(result) == 1;

    private sealed class MigrationsLockHandle : IMigrationsDatabaseLock
    {
        private readonly IHistoryRepository _historyRepository;
        private readonly Action _release;
        private bool _released;

        public MigrationsLockHandle(IHistoryRepository historyRepository, Action release)
        {
            _historyRepository = historyRepository;
            _release = release;
        }

        public IHistoryRepository HistoryRepository => _historyRepository;

        public IMigrationsDatabaseLock ReacquireIfNeeded(bool connectionReopened, bool? transactionRestarted)
        {
            if (!connectionReopened)
            {
                return this;
            }

            // La sesión anterior murió con la conexión: el servidor ya liberó su lock.
            _released = true;
            return _historyRepository.AcquireDatabaseLock();
        }

        public async Task<IMigrationsDatabaseLock> ReacquireIfNeededAsync(
            bool connectionReopened,
            bool? transactionRestarted,
            CancellationToken cancellationToken)
        {
            if (!connectionReopened)
            {
                return this;
            }

            _released = true;
            return await _historyRepository.AcquireDatabaseLockAsync(cancellationToken).ConfigureAwait(false);
        }

        public void Dispose()
        {
            if (_released)
            {
                return;
            }

            _released = true;
            _release();
        }

        public ValueTask DisposeAsync()
        {
            Dispose();
            return ValueTask.CompletedTask;
        }
    }
}
