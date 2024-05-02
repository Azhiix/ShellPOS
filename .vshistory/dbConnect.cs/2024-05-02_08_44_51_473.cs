using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace SezwanPayroll
{
    public class dbConnect
    {
        static string connectionString = ConfigurationManager.ConnectionStrings["SezwanPOS"].ConnectionString;
    }
}