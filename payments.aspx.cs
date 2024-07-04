using SezwanPayroll.DTO;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Web;
using System.Web.Services;
using System.Web.UI;

namespace SezwanPayroll
{
    public partial class payments : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
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

        [WebMethod]
        public static List<clsClient> displayClientInfo()
        {
            List<clsClient> clients = DbConnect.DisplayAllClients();
            return clients;
        }

        [WebMethod]

        public static List<clsSales> displayClientSales(string dateFrom, string dateTo, string clientID)
        {
            return DbConnect.displayAllClientBasedSales(dateFrom, dateTo, clientID);
        }



    }



}



//{ dateFrom: '01/07/2024', dateTo: '08/07/2024', clientID: '7'}