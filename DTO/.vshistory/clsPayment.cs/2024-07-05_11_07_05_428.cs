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

        public int PaymentID { get; set; }

        public int ClientID { get; set; }

        public string PaymentTypeID { get; set; }

        public string DateFrom { get; set; }

        public string DateTo { get; set; }

        public string SpecificDate { get; set; }

        public decimal Amount { get; set; }

        public string Reference { get; set; }


        public string Comments { get; set; }


        public string CreatedDate { get; set; }


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









