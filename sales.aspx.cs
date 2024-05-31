using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using SezwanPayroll;
using SezwanPayroll.DTO;

namespace SezwanPayroll
{
    public partial class sales : AuthenticatedPage // Inherit from AuthenticatedPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Page load logic here, if needed
            }
        }

        private bool IsUserAuthorized()
        {
            var token = HttpContext.Current.Request.Cookies["Token"]?.Value;

            if (string.IsNullOrEmpty(token))
                return false;

            ClaimsPrincipal principal = DTO.JWT.GetPrincipal(token);
            return principal != null;
        }

        // Non-static method to get user ID from token
        public string GetUserId(string token)
        {
            var principal = DTO.JWT.GetPrincipal(token);
            if (principal == null)
            {
                System.Diagnostics.Debug.WriteLine("Token validation failed: principal is null");
                return null;
            }

            var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "User_Id");
            if (userIdClaim == null)
            {
                System.Diagnostics.Debug.WriteLine("Token validation failed: User_Id claim not found");
                return null;
            }

            System.Diagnostics.Debug.WriteLine("Token validation successful: User_Id = " + userIdClaim.Value);
            return userIdClaim.Value;
        }

        [WebMethod]
        public static List<clsClient> ShowClients()
        {
            var context = HttpContext.Current;
            var authHeader = context.Request.Headers["Authorization"];

            System.Diagnostics.Debug.WriteLine("Authorization header: " + authHeader); // Log the header

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                throw new UnauthorizedAccessException("Authorization header is missing or invalid");

            var token = authHeader.Substring("Bearer ".Length).Trim();
            System.Diagnostics.Debug.WriteLine("Token received: " + token); // Log the token

            var page = new sales();
            string userId = page.GetUserId(token); // Validate token and get user ID

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Invalid token");

            List<clsClient> clients = DbConnect.DisplayAllClients();
            return clients;
        }

        [WebMethod]
        public static List<clsProducts> ShowProducts()
        {
            var context = HttpContext.Current;
            var authHeader = context.Request.Headers["Authorization"];

            System.Diagnostics.Debug.WriteLine("Authorization header: " + authHeader); // Log the header

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                throw new UnauthorizedAccessException("Authorization header is missing or invalid");

            var token = authHeader.Substring("Bearer ".Length).Trim();
            System.Diagnostics.Debug.WriteLine("Token received: " + token); // Log the token

            var page = new sales();
            string userId = page.GetUserId(token); // Validate token and get user ID

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Invalid token");

            List<clsProducts> products = DbConnect.DisplayAllProducts();
            return products;
        }

        [WebMethod]
        public static List<clsSalesData> AddSales(string salesJson, string clientInfoJson)
        {
            var context = HttpContext.Current;
            var authHeader = context.Request.Headers["Authorization"];

            System.Diagnostics.Debug.WriteLine("Authorization header: " + authHeader); // Log the header

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                throw new UnauthorizedAccessException("Authorization header is missing or invalid");

            var token = authHeader.Substring("Bearer ".Length).Trim();
            System.Diagnostics.Debug.WriteLine("Token received: " + token); // Log the token

            var page = new sales();
            string userId = page.GetUserId(token); // Validate token and get user ID

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Invalid token");

            // Deserialize clientInfoJson to dynamic object and add userId
            dynamic clientInfo = new JavaScriptSerializer().Deserialize<dynamic>(clientInfoJson);
            clientInfo["userId"] = userId;

            // Serialize clientInfo back to JSON string
            string updatedClientInfoJson = new JavaScriptSerializer().Serialize(clientInfo);

            // Call the CreateSalesData method with the updated JSON strings
            return DbConnect.CreateSalesData(salesJson, updatedClientInfoJson);
        }
    }
}
