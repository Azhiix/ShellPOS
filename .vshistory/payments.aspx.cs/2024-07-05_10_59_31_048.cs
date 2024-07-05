using SezwanPayroll;
using SezwanPayroll.DTO;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Xml.Linq;

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



        [WebMethod] 

        public static List<clsPayment> submitPayment(string dateFrom, string dateTo, string specificDate, decimal Amount, string Reference, string Comments)
        {
            return null;
        }

    }



}



//{ dateFrom: '01/07/2024', dateTo: '08/07/2024', clientID: '7'}



//dateFrom: paymentDateFrom || null,
//        dateTo: paymentDateTo || null,
//        amount: amount,
//        reference: reference,
//        comments: comments,
//        clientId: document.getElementById('clientSelect').value,
//        paymentTypeId: paymentType




//PaymentID   int	Unchecked
//ClientID	int	Unchecked
//PaymentTypeID	int	Unchecked
//DateFrom	varchar(10)	Checked
//DateTo	varchar(10)	Checked
//SpecificDate	varchar(10)	Checked
//Amount	decimal(10, 2)	Unchecked
//Reference	varchar(255)	Unchecked
//Comments	varchar(500)	Checked
//CreatedDate	varchar(19)	Unchecked
//		Unchecked