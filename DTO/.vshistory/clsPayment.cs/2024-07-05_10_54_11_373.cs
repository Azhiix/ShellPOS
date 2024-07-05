using SezwanPayroll;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SezwanPayroll.DTO
{
    public class clsPayment
    {
      
        public string ClientID { get; set; },

        public string PaymentTypeID { get; set; },

        public string dateFrom { get; set; },

        public string dateTo { get; set; },

        public string specificDate { get; set; },

        public string amount { get; set; },

        public string reference { get; set; },


        public string comments { get; set; },


        public string createdDate { get; set; }


    }
}







//SELECT TOP(1000) [PaymentTypeID]
//      ,[TypeName]
//FROM[Shell_POS].[dbo].[PaymentTypes]


//  SELECT TOP(1000) [PaymentID]
//      ,[ClientID]
//      ,[PaymentTypeID]
//      ,[DateFrom]
//      ,[DateTo]
//      ,[SpecificDate]
//      ,[Amount]
//      ,[Reference]
//      ,[Comments]
//      ,[CreatedDate]
//FROM[Shell_POS].[dbo].[Payments]









