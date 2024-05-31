using SezwanPayroll.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SezwanPayroll
{
    public partial class summary : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

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
        public static List<clsSales> GetSalesData(string token, string determineCurrentDate)
        {
            System.Diagnostics.Debug.WriteLine("Token received: " + token); // Log the token

            var page = new summary();
            string userId = page.GetUserId(token); // Validate token and get user ID

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Invalid token");

            // Convert userId to an integer
            int userIdInt = int.Parse(userId);
            Console.WriteLine("User ID: " + userIdInt); 

            return DbConnect.DisplaySalesInfo(determineCurrentDate, userIdInt);
        }
    }
}
