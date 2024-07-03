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


        [WebMethod()]
        public static List<clsSales> ShowSales(string dateFrom, string dateTo, string clientId, string vehicleRegNo)
        {
            
            List<clsSales> sales = DbConnect.RecordSales(dateFrom,dateTo, clientId, vehicleRegNo);

            return sales;

        }


        public static int DeleteSales(int saleId)
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