using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Windows.Forms;
using SezwanPayroll.DTO;

namespace SezwanPayroll
{
    public partial class Admin : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

            {
                if (!IsPostBack)
                {
                    if (!IsUserAuthorized())
                    {
                        Response.Redirect("login.aspx");
                    }
                }
            }
        }

        private static bool IsUserAuthorized()
        {
            var token = HttpContext.Current.Request.Cookies["Token"]?.Value;

            if (string.IsNullOrEmpty(token))
                return false;

            ClaimsPrincipal principal = DTO.JWT.GetPrincipal(token);
            return principal != null;
        }





        [WebMethod()]
        public static string validateCreateLogin(string username, string password, string roleid)
        {
            DbConnect dbConnect = new DbConnect();
            return dbConnect.createLogin(username, password, roleid);
        }


        [WebMethod()]

        public static string displayAllUsers()
        {

            return DbConnect.retreiveAllUsernames();
        }

        [WebMethod()]
        public static string updateUser(int userId, string username, int RoleId, string PermissionNames, string fname, string password)
        {
            // Pass the userId to the editUser method to use in the WHERE clause
            return DbConnect.editUser(userId,username, RoleId, PermissionNames, fname, password);
        }


        [WebMethod()]

        public static List<clsLogin> retrieveAllUserInfo()
        {
            return DbConnect.retreiveAllUserInfo();
        }





    }


}