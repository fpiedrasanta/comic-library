namespace Application.Interfaces;

public interface IPasswordValidator
{
    bool IsValid(string password, out string error);
}