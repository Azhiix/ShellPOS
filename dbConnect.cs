using System;
using System.Data.SqlClient;
using System.Configuration;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
using System.Collections.Generic;
using SezwanPayroll.DTO;
using System.EnterpriseServices;
using System.Security.Cryptography.X509Certificates;
using SezwanPayroll;
using System.Web.Script.Serialization;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.StartPanel;
using System.Runtime.InteropServices.WindowsRuntime;

public class DbConnect
{
    private SqlConnection conn;

    static string connectionString = ConfigurationManager.ConnectionStrings["POS Database"].ConnectionString;


    public static clsLogin ValidateLogin(string username, string password)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            SqlDataReader dataReader;

            // Use COLLATE to force case-sensitive comparison
            string sql = "SELECT UserId, RoleId, Fname FROM UserPermissions WHERE Username = @Username AND Password = @Password COLLATE SQL_Latin1_General_CP1_CS_AS";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@Username", username);
                command.Parameters.AddWithValue("@Password", password);

                Console.WriteLine($"Executing login check for Username: {username} and Password: {password}");


                dataReader = command.ExecuteReader();

                if (dataReader.Read())
                {

                    if (!dataReader.IsDBNull(0) && !dataReader.IsDBNull(1) && !dataReader.IsDBNull(2))
                    {
                        clsLogin user = new clsLogin
                        {
                            UserId = Convert.ToInt32(dataReader["UserId"]),
                            RoleId = Convert.ToInt32(dataReader["RoleId"]),
                            Fname = ""
                        };
                        return user;
                    }
                }
                return null;
            }
        }
    }

//    UserID int Unchecked
//Username nvarchar(255)   Unchecked
//Password    varchar(255)    Checked
//RoleId  nvarchar(50)    Unchecked
//PermissionNames nvarchar(255)   Checked
//fname   nvarchar(255)   Checked
//        Unchecked



    public string createLogin(string username, string password, string roleid, string fname, string permissionNames)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            try
            {
                connection.Open();
                string sql = "INSERT INTO UserPermissions (Username, Password, RoleId, fname, permissionNames) VALUES (@Username, @Password, @RoleId, @fname, @permissionNames)";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Password", password);
                    command.Parameters.AddWithValue("@RoleId", roleid);
                    command.Parameters.AddWithValue("@fname", fname);
                    command.Parameters.AddWithValue("@permissionNames", permissionNames);


                    int result = command.ExecuteNonQuery();
                    if (result > 0)
                        return "Success";
                    else
                        return "Error: No rows affected.";
                }
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }


    }


    public static string retreiveAllUsernames()

    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            SqlDataReader dataReader;

            string sql = "SELECT Username FROM UserPermissions";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                dataReader = command.ExecuteReader();

                string usernames = "";
                while (dataReader.Read())
                {
                    usernames += dataReader["Username"].ToString() + ",";
                }
                return usernames;
            }
        }

    }

    public static string editUser(int userId, string username, int RoleId, string PermissionNames, string fname, string password)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            string sql = @"
            UPDATE UserPermissions
            SET 
                RoleId = @RoleId, 
                PermissionNames = @PermissionNames, 
                fname = @fname,
                Username = @Username,
                Password = @Password

            WHERE 
                UserID=@UserId"; //first issue

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@UserID", userId);
                command.Parameters.AddWithValue("@Username", username);
                command.Parameters.AddWithValue("@RoleId", RoleId);
                command.Parameters.AddWithValue("@PermissionNames", PermissionNames);
                command.Parameters.AddWithValue("@fname", fname);
                command.Parameters.AddWithValue("@Password", password);

                int result = command.ExecuteNonQuery();
                if (result > 0)
                    return "Updated Successfully";
                else
                    return "Error: No rows affected.";
            }
        }
    }



    public static List<clsLogin> retreiveAllUserInfo()
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            List<clsLogin> userInfos = new List<clsLogin>();
            connection.Open();
            SqlDataReader dataReader;
            string sql = "SELECT UserId, Username, RoleId, PermissionNames, fname FROM UserPermissions";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                dataReader = command.ExecuteReader();
                while (dataReader.Read())
                {
                    userInfos.Add(new clsLogin
                    {
                        UserId = Convert.ToInt32(dataReader["UserId"]),
                        Username = dataReader["Username"].ToString(),
                        RoleId = Convert.ToInt32(dataReader["RoleId"]),
                        PermissionNames = dataReader["PermissionNames"].ToString(),
                        Fname = dataReader["fname"].ToString()
                    });
                }
                return userInfos;
            }




        }



        //returning all products and their relevant info



    }

    public static List<clsProducts> DisplayAllProducts()
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            List<clsProducts> products = new List<clsProducts>();
            connection.Open();

            SqlDataReader dataReader;

            string sql = "SELECT pi.ItemId, pi.ItemName, pi.UnitPrice, p.ProdTypeId, p.ProdTypeName " +
                         "FROM ProductItems pi " +
                         "JOIN Products p ON pi.ProdTypeId = p.ProdTypeId ";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                dataReader = command.ExecuteReader();
                while (dataReader.Read())
                {
                    products.Add(new clsProducts
                    {
                        ItemId = Convert.ToInt32(dataReader["ItemId"]),
                        ItemName = dataReader["ItemName"].ToString(),
                        UnitPrice = Convert.ToDecimal(dataReader["UnitPrice"]),
                        ProdTypeId = Convert.ToInt32(dataReader["ProdTypeId"]),
                        ProdTypeName = dataReader["ProdTypeName"].ToString()
                    });
                }
                dataReader.Close();
            }
            return products;
        }
    }


    public static List<clsSales> RecordSales(string dateFrom, string dateTo, string clientId, string vehicleRegNo)
    {
        List<clsSales> sales = new List<clsSales>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string sql = @"
SELECT
    s.SaleId,
    s.ClientId,
    c.Name AS ClientName,
    s.SaleDate,
    s.TotalCost,
    s.DriverName,
    s.CarRegNo,
    u.Username,
    si.SaleItemId,
    si.ItemId,
    p.ItemName,
    si.Quantity,
    si.UnitPrice,
    si.TotalCost AS ItemTotalCost
FROM Sales s
JOIN Clients c ON s.ClientId = c.ClientID
JOIN UserPermissions u ON s.UserId = u.UserID
JOIN SaleItems si ON s.SaleId = si.SaleId
JOIN ProductItems p ON si.ItemId = p.ItemId
WHERE 1=1";

            List<SqlParameter> parameters = new List<SqlParameter>();

            if (!string.IsNullOrEmpty(dateFrom))
            {
                sql += " AND TRY_CONVERT(DATE, s.SaleDate, 101) >= TRY_CONVERT(DATE, @DateFrom, 101)";
                parameters.Add(new SqlParameter("@DateFrom", dateFrom));
            }

            if (!string.IsNullOrEmpty(dateTo))
            {
                sql += " AND TRY_CONVERT(DATE, s.SaleDate, 101) <= TRY_CONVERT(DATE, @DateTo, 101)";
                parameters.Add(new SqlParameter("@DateTo", dateTo));
            }

            if (!string.IsNullOrEmpty(clientId))
            {
                sql += " AND s.ClientId = @ClientId";
                parameters.Add(new SqlParameter("@ClientId", clientId));
            }

            if (!string.IsNullOrEmpty(vehicleRegNo))
            {
                sql += " AND s.CarRegNo = @VehicleRegNo";
                parameters.Add(new SqlParameter("@VehicleRegNo", vehicleRegNo));
            }

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                foreach (var parameter in parameters)
                {
                    command.Parameters.Add(parameter);
                }

                using (SqlDataReader dataReader = command.ExecuteReader())
                {
                    while (dataReader.Read())
                    {
                        var saleId = Convert.ToInt32(dataReader["SaleId"]);
                        var sale = sales.FirstOrDefault(s => s.SaleId == saleId);

                        if (sale == null)
                        {
                            sale = new clsSales
                            {
                                SaleId = saleId,
                                ClientId = Convert.ToInt32(dataReader["ClientId"]),
                                ClientName = dataReader["ClientName"].ToString(),
                                SaleDate = Convert.ToDateTime(dataReader["SaleDate"]).ToString("MM/dd/yyyy"),
                                TotalCost = Convert.ToDecimal(dataReader["TotalCost"]),
                                DriverName = dataReader["DriverName"].ToString(),
                                CarRegNo = dataReader["CarRegNo"].ToString(),
                                Username = dataReader["Username"].ToString(),
                                SaleItems = new List<clsSaleItem>()
                            };

                            sales.Add(sale);
                        }

                        clsSaleItem saleItem = new clsSaleItem
                        {
                            SaleItemId = Convert.ToInt32(dataReader["SaleItemId"]),
                            ItemId = Convert.ToInt32(dataReader["ItemId"]),
                            ItemName = dataReader["ItemName"].ToString(),
                            Quantity = Convert.ToInt32(dataReader["Quantity"]),
                            UnitPrice = Convert.ToDecimal(dataReader["UnitPrice"]),
                            TotalCost = Convert.ToDecimal(dataReader["ItemTotalCost"])
                        };

                        sale.SaleItems.Add(saleItem);
                    }
                }
            }
        }

        return sales;
    }











public static List<clsClient> DisplayAllClients()
{
    using (SqlConnection connection = new SqlConnection(connectionString))
    {
        List<clsClient> clients = new List<clsClient>();
        connection.Open();

        SqlDataReader dataReader;
        
        // Using STRING_AGG to concatenate the RegistrationNo and DriverName
        string sql = "SELECT c.ClientID, c.Name, c.ContactInfo, c.Address, " +
                     "STRING_AGG(v.RegistrationNo, ', ') AS RegistrationNos, " +
                     "STRING_AGG(v.DriverName, ', ') AS DriverNames " +
                     "FROM Clients c " +
                     "JOIN Vehicles v ON c.ClientID = v.ClientID " +
                     "GROUP BY c.ClientID, c.Name, c.ContactInfo, c.Address";

        using (SqlCommand command = new SqlCommand(sql, connection))
        {
            dataReader = command.ExecuteReader();
            while (dataReader.Read())
            {
                clients.Add(new clsClient
                {
                    ClientID = Convert.ToInt32(dataReader["ClientID"]),
                    Name = dataReader["Name"].ToString(),
                    ContactInfo = dataReader["ContactInfo"].ToString(),
                    Address = dataReader["Address"].ToString(),
                    RegistrationNo = dataReader["RegistrationNos"].ToString(),
                    DriverName = dataReader["DriverNames"].ToString(),
                });
            }
            dataReader.Close();
        }
        return clients;
    }
}



    public static List<clsSalesData> CreateSalesData(string salesJson, string clientInfoJson)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            List<clsSalesData> salesData = new List<clsSalesData>();
            connection.Open();

            SqlTransaction transaction = connection.BeginTransaction();

            try
            {
                // Deserialize the JSON objects
                List<clsSalesData> salesDataList = new JavaScriptSerializer().Deserialize<List<clsSalesData>>(salesJson);
                dynamic clientInfo = new JavaScriptSerializer().Deserialize<dynamic>(clientInfoJson);

                // Convert necessary fields to the correct types and validate lengths
                int clientId = Convert.ToInt32(clientInfo["ClientId"]);
                string saleDate = clientInfo["date"];
                decimal totalCost = Convert.ToDecimal(clientInfo["totalCost"]);
                string driverName = clientInfo["driverName"];
                string carRegNo = clientInfo["carRegNo"];
                int userId = Convert.ToInt32(clientInfo["userId"]);

                // Ensure lengths do not exceed the maximum allowed lengths
                if (driverName.Length > 255)
                {
                    driverName = driverName.Substring(0, 255);
                }

                if (carRegNo.Length > 50)
                {
                    carRegNo = carRegNo.Substring(0, 50);
                }

                // Ensure SaleDate does not exceed 10 characters
                if (saleDate.Length > 10)
                {
                    saleDate = saleDate.Substring(0, 10);
                }

                // Clean the date string to remove any extra characters
                saleDate = saleDate.Split(',')[0].Trim();

                // Insert Sales data and get the SaleId
                string sqlInsertQuery = @"
            INSERT INTO Sales (ClientId, SaleDate, TotalCost, DriverName, CarRegNo, UserId) 
            VALUES (@ClientId, @SaleDate, @TotalCost, @DriverName, @CarRegNo, @UserId);
            SELECT SCOPE_IDENTITY()";

                SqlCommand saleCmd = new SqlCommand(sqlInsertQuery, connection, transaction);
                saleCmd.Parameters.AddWithValue("@ClientId", clientId);
                saleCmd.Parameters.AddWithValue("@SaleDate", saleDate);
                saleCmd.Parameters.AddWithValue("@TotalCost", totalCost);
                saleCmd.Parameters.AddWithValue("@DriverName", driverName);
                saleCmd.Parameters.AddWithValue("@CarRegNo", carRegNo);
                saleCmd.Parameters.AddWithValue("@UserId", userId);

                object result = saleCmd.ExecuteScalar();

                if (result == null || !int.TryParse(result.ToString(), out int saleId))
                {
                    throw new Exception("Failed to retrieve SaleId.");
                }

                // Insert SalesItems data
                string sqlInsertItemsQuery = @"
            INSERT INTO SaleItems (SaleId, ItemId, Quantity, UnitPrice, TotalCost) 
            VALUES (@SaleId, @ItemId, @Quantity, @UnitPrice, @TotalCost)";

                foreach (var item in salesDataList)
                {
                    SqlCommand saleItemCmd = new SqlCommand(sqlInsertItemsQuery, connection, transaction);
                    saleItemCmd.Parameters.AddWithValue("@SaleId", saleId);
                    saleItemCmd.Parameters.AddWithValue("@ItemId", item.ItemId);
                    saleItemCmd.Parameters.AddWithValue("@Quantity", item.Quantity);
                    saleItemCmd.Parameters.AddWithValue("@UnitPrice", item.UnitPrice);
                    saleItemCmd.Parameters.AddWithValue("@TotalCost", item.TotalItemCost);

                    saleItemCmd.ExecuteNonQuery();
                }

                transaction.Commit();
                return salesData;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                // Log the exception for debugging purposes
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return null;
            }
        }
    }



public static List<clsProducts> displayProducts() 
{
        List<clsProducts> products = new List<clsProducts>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string sql = "SELECT * FROM ProductItems";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                using (SqlDataReader dataReader = command.ExecuteReader())
                {
                    while (dataReader.Read())
                    {
                        clsProducts product = new clsProducts
                        {
                            ItemId = Convert.ToInt32(dataReader["ItemId"]),
                            ItemName = dataReader["ItemName"].ToString(),
                            UnitPrice = Convert.ToDecimal(dataReader["UnitPrice"]),
                            ProdTypeId = Convert.ToInt32(dataReader["ProdTypeId"])
                        };

                        products.Add(product);
                    }
                }
            }

            return products;
        }


    }





    public static List<clsProducts> UpdateProducts(int itemId, string itemName, decimal unitPrice)
    {
        List<clsProducts> products = new List<clsProducts>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            // Update the product
            string updateSql = "UPDATE ProductItems SET ItemName = @ItemName, UnitPrice = @UnitPrice WHERE ItemId = @ItemId";
            using (SqlCommand updateCommand = new SqlCommand(updateSql, connection))
            {
                updateCommand.Parameters.AddWithValue("@ItemId", itemId);
                updateCommand.Parameters.AddWithValue("@ItemName", itemName);
                updateCommand.Parameters.AddWithValue("@UnitPrice", unitPrice);
                updateCommand.ExecuteNonQuery();  // Executes the update operation
            }

            // Optionally, retrieve the updated product to confirm the changes
            string selectSql = "SELECT ItemId, ItemName, UnitPrice, ProdTypeId FROM ProductItems WHERE ItemId = @ItemId";
            using (SqlCommand selectCommand = new SqlCommand(selectSql, connection))
            {
                selectCommand.Parameters.AddWithValue("@ItemId", itemId);
                using (SqlDataReader dataReader = selectCommand.ExecuteReader())
                {
                    while (dataReader.Read())
                    {
                        products.Add(new clsProducts
                        {
                            ItemId = Convert.ToInt32(dataReader["ItemId"]),
                            ItemName = dataReader["ItemName"].ToString(),
                            UnitPrice = Convert.ToDecimal(dataReader["UnitPrice"]),
                            ProdTypeId = Convert.ToInt32(dataReader["ProdTypeId"])
                        });
                    }
                }
            }
        }

        return products;  
    }




    // The Summary Page 

    public static List<clsSales> DisplaySalesInfo(string determineCurrentDate, int currentUserId)
    {
        List<clsSales> sales = new List<clsSales>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string sql = @"
            SELECT
                s.SaleId,
                s.ClientId,
                c.Name AS ClientName,
                s.SaleDate,
                s.TotalCost,
                s.DriverName,
                s.CarRegNo,
                u.Username,
                si.SaleItemId,
                si.ItemId,
                p.ItemName,
                si.Quantity,
                si.UnitPrice,
                si.TotalCost AS ItemTotalCost
            FROM Sales s
            JOIN Clients c ON s.ClientId = c.ClientID
            JOIN UserPermissions u ON s.UserId = u.UserID
            JOIN SaleItems si ON s.SaleId = si.SaleId
            JOIN ProductItems p ON si.ItemId = p.ItemId
            
            WHERE s.SaleDate = @SaleDate AND s.UserId = @UserId";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@SaleDate", determineCurrentDate);
                command.Parameters.AddWithValue("@UserId", currentUserId);

                using (SqlDataReader dataReader = command.ExecuteReader())
                {
                    while (dataReader.Read())
                    {
                        var saleId = Convert.ToInt32(dataReader["SaleId"]);
                        var sale = sales.FirstOrDefault(s => s.SaleId == saleId);

                        if (sale == null)
                        {
                            sale = new clsSales
                            {
                                SaleId = saleId,
                                ClientId = Convert.ToInt32(dataReader["ClientId"]),
                                ClientName = dataReader["ClientName"].ToString(),
                                SaleDate = Convert.ToDateTime(dataReader["SaleDate"]).ToString("MM/dd/yyyy"),
                                TotalCost = Convert.ToDecimal(dataReader["TotalCost"]),
                                DriverName = dataReader["DriverName"].ToString(),
                                CarRegNo = dataReader["CarRegNo"].ToString(),
                                Username = dataReader["Username"].ToString(),
                               
                                SaleItems = new List<clsSaleItem>()
                            };

                            sales.Add(sale);
                        }

                        clsSaleItem saleItem = new clsSaleItem
                        {
                            SaleItemId = Convert.ToInt32(dataReader["SaleItemId"]),
                            ItemId = Convert.ToInt32(dataReader["ItemId"]),
                            ItemName = dataReader["ItemName"].ToString(),
                            Quantity = Convert.ToInt32(dataReader["Quantity"]),
                            UnitPrice = Convert.ToDecimal(dataReader["UnitPrice"]),
                            TotalCost = Convert.ToDecimal(dataReader["ItemTotalCost"])
                        };

                        sale.SaleItems.Add(saleItem);
                    }
                }
            }
        }

        return sales;
    }




}









//''System.Collections.Generic.Dictionary<string, object>' does not contain a definition for 'clientId''


//public static List<clsSalesData> DisplaySalesData()
//  {


// using (SqlConnection connection = new SqlConnection(connectionString))
//      {
//          List<clsSalesData> salesData = new List<clsSalesData>();
//          connection.Open();

//          SqlDataReader dataReader;

//          string sql = "SELECT s.ProductType, si.ItemId, si.ItemName, si.Quantity, si.TotalItemCost, s.ClientId, s.Username, s.Date, s.DriverName, s.CarRegNo, s.Mileage, s.TotalCost " +
//                       "FROM SalesItems si " +
//                       "JOIN Sales s ON si.SaleId = s.SaleId";

//          using (SqlCommand command = new SqlCommand(sql, connection))
//          {
//              dataReader = command.ExecuteReader();
//              while (dataReader.Read())
//              {
//                  salesData.Add(new clsSalesData
//                  {
//                      ProductType = dataReader["ProductType"].ToString(),
//                      ItemId = Convert.ToInt32(dataReader["ItemId"]),
//                      ItemName = dataReader["ItemName"].ToString(),
//                      Quantity = Convert.ToDecimal(dataReader["Quantity"]),
//                      TotalItemCost = Convert.ToDecimal(dataReader["TotalItemCost"]),
//                      clientId = Convert.ToInt32(dataReader["ClientId"]),
//                      Username = dataReader["Username"].ToString(),
//                      Date = dataReader["Date"].ToString(),
//                      DriverName = dataReader["DriverName"].ToString(),
//                      CarRegNo = dataReader["CarRegNo"].ToString(),
//                      Mileage = Convert.ToInt32(dataReader["Mileage"]),
//                      TotalCost = Convert.ToDecimal(dataReader["TotalCost"])
//                  });
//              }
//              dataReader.Close();
//          }
//          return salesData;
//      }   
//  }


/*{ productType: 'Fuel', item: '1', itemName: 'SUPER - Rs 66.2', quantity: '44', totalItemCost: 2912.8 } this is for SalesItems, { clientId: '3', Username: 'admin', date: '5/20/2024, 3:58:22 PM', driverName: '3', carRegNo: 'LMN456', … } */



//{ productType: 'Cords', item: '4', itemName: 'CORD', quantity: '88', totalItemCost: 8800, …}
//{ clientId: '3', Username: 'admin', date: '5/20/2024, 5:13:29 PM', driverName: '3', carRegNo: 'LMN456', …}





