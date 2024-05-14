using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SezwanPayroll.DTO
{
    public class clsProducts
    {

        public int ProdTypeId { get; set; }
        public string ProdTypeName { get; set; }

       
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public decimal UnitPrice { get; set; }



    }
}