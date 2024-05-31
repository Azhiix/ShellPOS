using System;
using System.Web;
using System.Web.UI;

namespace SezwanPayroll
{
    public partial class Logout : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Invalidate the token
                HttpCookie tokenCookie = new HttpCookie("Token")
                {
                    Expires = DateTime.Now.AddDays(-1),
                    Path = "/"
                };
                Response.Cookies.Add(tokenCookie);
                Response.Redirect("~/Login.aspx");
            }
        }
    }
}
