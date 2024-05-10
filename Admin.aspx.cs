﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Windows.Forms;

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

            ClaimsPrincipal principal = JWT.GetPrincipal(token);
            return principal != null;
        }



       

        [WebMethod()]
        public static  string validateCreateLogin(string username, string password, string roleid)
        {
            DbConnect dbConnect = new DbConnect();
            return dbConnect.createLogin(username, password, roleid);
        }

        
        [WebMethod()]

        public static string displayAllUsers()
        {
            
            return DbConnect.retreiveAllUsernames();
        }


        public static string updateUser(string username, string password, int RoleId, string PermissionNames, string fname)
        {
            return DbConnect.editUser(username, password, RoleId, PermissionNames, fname);
        
            
        }




    }


}