﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
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

        [WebMethod()]
        public bool TestDbConnection()
        {
            DbConnect dbConnect = new DbConnect();
            return dbConnect.TestConnection();
           
        }





    }
   

}
