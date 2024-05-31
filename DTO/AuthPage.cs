using System;
using System.Web;
using System.Web.UI;
using SezwanPayroll.DTO;

namespace SezwanPayroll
{
    public class AuthenticatedPage : Page
    {
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            string token = HttpContext.Current.Request.Cookies["Token"]?.Value;
            if (string.IsNullOrEmpty(token) || DTO.JWT.GetPrincipal(token) == null)
            {
                HttpContext.Current.Response.Redirect("~/Login.aspx");
            }
        }
    }
}
