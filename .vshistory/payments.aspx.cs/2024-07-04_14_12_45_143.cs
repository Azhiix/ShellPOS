﻿using SezwanPayroll.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SezwanPayroll
{
    public partial class payments : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
          

        }



        [WebMethod()]

        public static List<clsClient> ShowClients()
        {
            List<clsClient> clients = DbConnect.DisplayAllClients();
            return clients;
        }

    }
}