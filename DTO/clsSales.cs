using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SezwanPayroll.DTO
{
    public class clsSales
    {
        public int SaleId { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public string SaleDate { get; set; }
        public decimal TotalCost { get; set; }
        public string DriverName { get; set; }
        public string CarRegNo { get; set; }

        public string Username { get; set;}
    }



}