using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SezwanPayroll.DTO
{
    public class clsClient
    {
       public int ClientID { get; set; }

        public string Name { get; set; }

        public string ContactInfo { get; set; }

        public string Address { get; set; }

        public string RegistrationNo { get; set; }

                      
       public string DriverName { get; set; }



    }
}













//ClientID    int	Unchecked
//Name	nvarchar(255)	Unchecked
//ContactInfo	nvarchar(255)	Checked
//Address	nvarchar(255)	Checked
//	nchar(10)	Checked
//		Unchecked