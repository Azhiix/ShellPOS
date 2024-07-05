using SezwanPayroll;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;

namespace SezwanPayroll.DTO
{
    public class clsPayment
    {

        public string ClientID { get; set; }

        public string PaymentTypeID { get; set; }

        public string dateFrom { get; set; }

        public string dateTo { get; set; }

        public string specificDate { get; set; }

        public string amount { get; set; }

        public string reference { get; set; }


        public string comments { get; set; }


        public string createdDate { get; set; }


    }
}



//PaymentID = Convert.ToInt32(dataReader["PaymentID"]),
//                                ClientID = Convert.ToInt32(dataReader["ClientID"]),
//                                PaymentTypeID = Convert.ToInt32(dataReader["PaymentTypeID"]),
//                                DateFrom = dataReader["DateFrom"] != DBNull.Value ? dataReader["DateFrom"].ToString() : null,
//                                DateTo = dataReader["DateTo"] != DBNull.Value ? dataReader["DateTo"].ToString() : null,
//                                SpecificDate = dataReader["SpecificDate"] != DBNull.Value ? dataReader["SpecificDate"].ToString() : null,
//                                Amount = Convert.ToDecimal(dataReader["Amount"]),
//                                Reference = dataReader["Reference"].ToString(),
//                                Comments = dataReader["Comments"] != DBNull.Value ? dataReader["Comments"].ToString() : null,
//                                CreatedDate = dataReader["CreatedDate"].ToString()





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









