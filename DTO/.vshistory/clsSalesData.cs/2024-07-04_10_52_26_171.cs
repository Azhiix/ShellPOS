using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SezwanPayroll.DTO
{
    public class clsSalesData
    {

        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public decimal UnitPrice { get; set; }

        public string ProductType { get; set; }

        public decimal Quantity { get; set; }

        public decimal TotalItemCost { get; set; }

        public string CarRegNo { get; set; }

        public int ClientId { get; set; }

        public string date { get; set; }

        public string DriverName { get; set; }

        public  int Mileage { get; set; }

        public decimal TotalCost { get; set; }

        public string Username { get; set; }

        public int isCashorCredit { get; set; }


    }
}




//{ productType: 'Cords', item: '4', itemName: 'CORD', quantity: '88', totalItemCost: 8800, …}
//{ clientId: '3', Username: 'admin', date: '5/20/2024, 5:13:29 PM', driverName: '3', carRegNo: 'LMN456', …}