using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;

namespace SezwanPayroll.DTO
{
    public class JWT
    {
        private static readonly string secretKey = "pbRCLIbbr3wOhDXOrNSB9AY-Gzy9CDqUuDkh_qjFpNQ";

        public static string GenerateJwtToken(string username, int roleId, int userId)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("role_id", roleId.ToString()),
                new Claim("User_Id", userId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: "Sezwan Technologies Ltd",
                audience: "Sezwan Technologies Ltd",
                claims: claims,
                expires: DateTime.Now.AddMinutes(300),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static ClaimsPrincipal GetPrincipal(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = (JwtSecurityToken)tokenHandler.ReadToken(token);
                if (jwtToken == null) return null;

                var key = Encoding.ASCII.GetBytes(secretKey);
                var parameters = new TokenValidationParameters()
                {
                    RequireExpirationTime = true,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };

                SecurityToken securityToken;
                var principal = tokenHandler.ValidateToken(token, parameters, out securityToken);
                return principal;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Token validation failed: " + ex.Message);
                return null;
            }
        }
    }
}
