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
    public partial class reports : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        { if (!IsPostBack)
            {
                if (!IsUserAuthorized())
                {
                    Response.Redirect("login.aspx");
                }
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


        [WebMethod()]

        public static List<clsClient> ShowClients()
        {
            List<clsClient> clients = DbConnect.DisplayAllClients();
            return clients;
        }

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

        [WebMethod()] 

        public static List<clsUserPermission> DisplayUserAgent()
        {
            return DbConnect.DisplayUserAgent();
        }

        [WebMethod()]
        public static List<clsSales> ShowSales(string dateFrom, string dateTo, string clientId, string vehicleRegNo, int agentId)
        {
            
            List<clsSales> sales = DbConnect.RecordSales(dateFrom,dateTo, clientId, vehicleRegNo, agentId);

            return sales;

        }


        [WebMethod]
        public static bool DeleteSale(int saleId)
        {
            return DbConnect.DeleteSales(saleId);
        }

    }

}

//const payload = {
//            dateFrom: dateFrom,
//            dateTo: dateTo,
//            client: client,
//            vehicleRegNo: vehicleRegNo
//        //};          