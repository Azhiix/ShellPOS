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
        public string Username { get; set; }

        public string agentName { get; set; }
        public List<clsSaleItem> SaleItems { get; set; }

        public List<clsUserPermission> UserPermissions { get; set; }
    }

    public class clsSaleItem
    {
        public int SaleItemId { get; set; }
        public int ItemId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalCost { get; set; }

        public string ItemName { get; set; }
    }


    public class clsUserPermission
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string RoleName { get; set; }
        public string PermissionName { get; set; }
    }


}