using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IAuthService _authService;
    private readonly IRefreshTokenCookieSettingsProvider _cookieSettings;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IGoogleClientSettingsProvider _googleClientSettingsProvider;
    private readonly IAccountDeletionService _accountDeletionService;
    private readonly IUserQueryService _userQueryService;

    public UsersController(IUserService userService, IAuthService authService, IRefreshTokenCookieSettingsProvider cookieSettings, IPasswordResetService passwordResetService, IGoogleClientSettingsProvider googleClientSettingsProvider, IAccountDeletionService accountDeletionService, IUserQueryService userQueryService)
    {
        _userService = userService;
        _authService = authService;
        _cookieSettings = cookieSettings;
        _passwordResetService = passwordResetService;
        _googleClientSettingsProvider = googleClientSettingsProvider;
        _accountDeletionService = accountDeletionService;
        _userQueryService = userQueryService;
    }

    [HttpPost("register")]
    [EnableRateLimiting(RateLimitPolicies.AuthRegister)]
    public async Task<IActionResult> Register([FromForm] RegisterUserFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new Application.DTOs.RegisterUserApiRequest(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Password,
            request.NationalityId,
            avatarData,
            avatarFileName);

        var response = await _userService.RegisterAsync(applicationRequest, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, new ApiResponse<RegisterUserResponse>(true, "User registered successfully.", StatusCodes.Status201Created, response));
    }

    [HttpPost("validate-email")]
    public async Task<IActionResult> ValidateEmail([FromBody] ValidateEmailApiRequest request, CancellationToken cancellationToken)
    {
        var response = await _userService.ValidateEmailAsync(request, cancellationToken);

        return Ok(new ApiResponse<ValidateEmailResponse>(true, "Email validated successfully.", StatusCodes.Status200OK, response));
    }

    [HttpPost("resend-validation-email")]
    [EnableRateLimiting(RateLimitPolicies.AuthResendCode)]
    public async Task<IActionResult> ResendValidationEmail([FromBody] ResendValidationEmailApiRequest request, CancellationToken cancellationToken)
    {
        var response = await _userService.ResendValidationEmailAsync(request, cancellationToken);
        return Ok(new ApiResponse<ResendValidationEmailResponse>(true, "Validation email sent.", StatusCodes.Status200OK, response));
    }

    [HttpPost("google-login")]
    [EnableRateLimiting(RateLimitPolicies.AuthGoogleLogin)]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginWithGoogleAsync(request.IdToken, cancellationToken);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = _cookieSettings.GetHttpOnly(),
            Secure = _cookieSettings.GetSecure(),
            SameSite = Enum.Parse<SameSiteMode>(_cookieSettings.GetSameSite(), true),
            Expires = DateTime.UtcNow.AddDays(_cookieSettings.GetExpirationDays()),
            Path = "/"
        };

        Response.Cookies.Append(_cookieSettings.GetCookieName(), result.RefreshTokenRaw, cookieOptions);

        return Ok(new ApiResponse<AuthResponse>(true, "Inicio de sesión con Google exitoso.", StatusCodes.Status200OK, result.AuthResponse));
    }

    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.AuthLogin)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password, cancellationToken);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = _cookieSettings.GetHttpOnly(),
            Secure = _cookieSettings.GetSecure(),
            SameSite = Enum.Parse<SameSiteMode>(_cookieSettings.GetSameSite(), true),
            Expires = DateTime.UtcNow.AddDays(_cookieSettings.GetExpirationDays()),
            Path = "/"
        };

        Response.Cookies.Append(_cookieSettings.GetCookieName(), result.RefreshTokenRaw, cookieOptions);

        return Ok(new ApiResponse<AuthResponse>(true, "Login successful.", StatusCodes.Status200OK, result.AuthResponse));
    }

    [HttpPost("refresh-token")]
    [EnableRateLimiting(RateLimitPolicies.AuthRefresh)]
    public async Task<IActionResult> RefreshToken(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue(_cookieSettings.GetCookieName(), out var refreshToken))
        {
            return Unauthorized(new ApiResponse<object>(false, "Invalid refresh token.", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _authService.RefreshTokenAsync(refreshToken, cancellationToken);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = _cookieSettings.GetHttpOnly(),
            Secure = _cookieSettings.GetSecure(),
            SameSite = Enum.Parse<SameSiteMode>(_cookieSettings.GetSameSite(), true),
            Expires = DateTime.UtcNow.AddDays(_cookieSettings.GetExpirationDays()),
            Path = "/"
        };

        Response.Cookies.Append(_cookieSettings.GetCookieName(), result.RefreshTokenRaw, cookieOptions);

        return Ok(new ApiResponse<AuthResponse>(true, "Token refreshed successfully.", StatusCodes.Status200OK, result.AuthResponse));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(_cookieSettings.GetCookieName(), out var refreshToken))
        {
            await _authService.LogoutAsync(refreshToken, cancellationToken);
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = _cookieSettings.GetHttpOnly(),
            Secure = _cookieSettings.GetSecure(),
            SameSite = Enum.Parse<SameSiteMode>(_cookieSettings.GetSameSite(), true),
            Expires = DateTime.UtcNow.AddDays(-1),
            Path = "/"
        };

        Response.Cookies.Delete(_cookieSettings.GetCookieName(), cookieOptions);

        return Ok(new ApiResponse<object>(true, "OK", StatusCodes.Status200OK, null));
    }

    [HttpPost("logout-all")]
    public async Task<IActionResult> LogoutAll(CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(_cookieSettings.GetCookieName(), out var refreshToken))
        {
            await _authService.LogoutAllAsync(refreshToken, cancellationToken);
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = _cookieSettings.GetHttpOnly(),
            Secure = _cookieSettings.GetSecure(),
            SameSite = Enum.Parse<SameSiteMode>(_cookieSettings.GetSameSite(), true),
            Expires = DateTime.UtcNow.AddDays(-1),
            Path = "/"
        };

        Response.Cookies.Delete(_cookieSettings.GetCookieName(), cookieOptions);

        return Ok(new ApiResponse<object>(true, "OK", StatusCodes.Status200OK, null));
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting(RateLimitPolicies.AuthForgotPassword)]
    public async Task<IActionResult> ForgotPassword([FromBody] RequestPasswordResetApiRequest request, CancellationToken cancellationToken)
    {
        var response = await _passwordResetService.RequestResetAsync(new Application.DTOs.RequestPasswordResetRequest(request.Email), cancellationToken);
        return Ok(new ApiResponse<ForgotPasswordResponse>(true, "If the email exists, a recovery code has been sent.", StatusCodes.Status200OK, new ForgotPasswordResponse(response.ExpiresInMinutes)));
    }

    [HttpPost("resend-password-reset-code")]
    [EnableRateLimiting(RateLimitPolicies.AuthResendCode)]
    public async Task<IActionResult> ResendPasswordResetCode([FromBody] ResendPasswordResetApiRequest request, CancellationToken cancellationToken)
    {
        var response = await _passwordResetService.ResendResetAsync(new Application.DTOs.ResendPasswordResetRequest(request.Email), cancellationToken);
        return Ok(new ApiResponse<ResendPasswordResetCodeResponse>(true, "If the email exists, a recovery code has been sent.", StatusCodes.Status200OK, new ResendPasswordResetCodeResponse(response.ExpiresInMinutes)));
    }

    [HttpPost("validate-password-reset-code")]
    public async Task<IActionResult> ValidatePasswordResetCode([FromBody] ValidatePasswordResetApiRequest request, CancellationToken cancellationToken)
    {
        var response = await _passwordResetService.ValidateResetAsync(new Application.DTOs.ValidatePasswordResetRequest(request.Email, request.Code), cancellationToken);
        return Ok(new ApiResponse<ValidatePasswordResetCodeResponse>(true, "Code validated successfully.", StatusCodes.Status200OK, new ValidatePasswordResetCodeResponse(response.AuthorizationToken)));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ChangePasswordApiRequest request, CancellationToken cancellationToken)
    {
        await _passwordResetService.ChangePasswordAsync(new Application.DTOs.ChangePasswordRequest(request.Email, request.AuthorizationToken, request.NewPassword), cancellationToken);
        return Ok(new ApiResponse<ResetPasswordResponse>(true, "Password changed successfully.", StatusCodes.Status200OK, new ResetPasswordResponse()));
    }

    [HttpGet("google-client-id")]
    public async Task<IActionResult> GetGoogleClientId(CancellationToken cancellationToken)
    {
        var clientId = await Task.Run(() => _googleClientSettingsProvider.GetClientId(), cancellationToken);
        var response = new GoogleClientIdResponse(clientId);
        return Ok(new ApiResponse<GoogleClientIdResponse>(true, "Google Client ID retrieved successfully.", StatusCodes.Status200OK, response));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileApiRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userIdClaim is null || !long.TryParse(userIdClaim, out var userId))
        {
            throw new InvalidCredentialsException("Se generó un error durante el proceso de autenticación.");
        }

        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new Application.DTOs.UpdateProfileRequest(
            request.FirstName,
            request.LastName,
            request.CountryId,
            request.ImageId,
            avatarData,
            avatarFileName);

        var response = await _userService.UpdateProfileAsync(userId, applicationRequest, cancellationToken);
        return Ok(new ApiResponse<UserProfileResponse>(true, "Profile updated successfully.", StatusCodes.Status200OK, response));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userIdClaim is null || !long.TryParse(userIdClaim, out var userId))
        {
            throw new InvalidCredentialsException("Se generó un error durante el proceso de autenticación.");
        }

        var response = await _userService.GetProfileAsync(userId, cancellationToken);
        return Ok(new ApiResponse<UserProfileResponse>(true, "Profile retrieved successfully.", StatusCodes.Status200OK, response));
    }

    [Authorize]
    [HttpPost("account-deletion/request")]
    [EnableRateLimiting(RateLimitPolicies.AuthAccountDeletion)]
    public async Task<IActionResult> RequestAccountDeletion(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userIdClaim is null || !long.TryParse(userIdClaim, out var userId))
        {
            throw new InvalidCredentialsException("Se generó un error durante el proceso de autenticación.");
        }

        var response = await _accountDeletionService.RequestAsync(userId, cancellationToken);
        return Ok(new ApiResponse<RequestAccountDeletionResponse>(true, "Account deletion code sent.", StatusCodes.Status200OK, response));
    }

    [Authorize]
    [HttpPost("account-deletion/confirm")]
    [EnableRateLimiting(RateLimitPolicies.AuthAccountDeletion)]
    public async Task<IActionResult> ConfirmAccountDeletion([FromBody] ConfirmAccountDeletionApiRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userIdClaim is null || !long.TryParse(userIdClaim, out var userId))
        {
            throw new InvalidCredentialsException("Se generó un error durante el proceso de autenticación.");
        }

        var response = await _accountDeletionService.ConfirmAsync(userId, request.Code, cancellationToken);
        return Ok(new ApiResponse<ConfirmAccountDeletionResponse>(true, response.Message, StatusCodes.Status200OK, response));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersRequest request, CancellationToken cancellationToken)
    {
        var result = await _userQueryService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<UserListItemDto>>(true, "Users retrieved successfully.", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("active-for-ban")]
    public async Task<IActionResult> GetActiveUsersForBanSelection([FromQuery] GetUsersForBanSelectionRequest request, CancellationToken cancellationToken)
    {
        var result = await _userQueryService.GetActiveForBanSelectionAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<UserListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("{userId:long}")]
    public async Task<IActionResult> GetUserDetail(long userId, CancellationToken cancellationToken)
    {
        var result = await _userQueryService.GetDetailAsync(userId, cancellationToken);
        return Ok(new ApiResponse<UserDetailDto>(true, "User detail retrieved successfully.", StatusCodes.Status200OK, result));
    }
}
