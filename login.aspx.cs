using Microsoft.IdentityModel.Tokens;
using SezwanPayroll.DTO;
using System;
using System.Collections.Generic;
using System.EnterpriseServices.Internal;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SezwanPayroll
{
    public partial class Login : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }








        [WebMethod]
        public static string ValidateLogin(string username, string password)
        {
            clsLogin user = DbConnect.ValidateLogin(username, password);

            if (user != null)
            {
                string token = DTO.JWT.GenerateJwtToken(username, user.RoleId, user.UserId);  // Generate JWT token
                return new JavaScriptSerializer().Serialize(new
                {
                    User = user,
                    Token = token
                });
            }
            else
            {
                return new JavaScriptSerializer().Serialize(new { Error = "Authentication failed" });
            }
        }




    }

}