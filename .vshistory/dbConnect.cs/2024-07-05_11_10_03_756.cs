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
using System.Globalization;
using System.Reflection.Emit;

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

    public static List<clsSales> RecordSales(string dateFrom, string dateTo, string clientId, string vehicleRegNo, int agentId)
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
WHERE 1=1"; // Start with a WHERE clause that is always true to simplify appending conditions

            List<SqlParameter> parameters = new List<SqlParameter>();

            if (!string.IsNullOrEmpty(dateFrom))
            {
                DateTime fromDate;
                if (DateTime.TryParseExact(dateFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out fromDate))
                {
                    sql += " AND CONVERT(DATE, s.SaleDate, 103) >= @DateFrom";
                    parameters.Add(new SqlParameter("@DateFrom", fromDate));
                }
                else
                {
                    throw new ArgumentException("Invalid date format for 'dateFrom'. Please use 'dd/MM/yyyy'.");
                }
            }

            if (!string.IsNullOrEmpty(dateTo))
            {
                DateTime toDate;
                if (DateTime.TryParseExact(dateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out toDate))
                {
                    sql += " AND CONVERT(DATE, s.SaleDate, 103) <= @DateTo";
                    parameters.Add(new SqlParameter("@DateTo", toDate));
                }
                else
                {
                    throw new ArgumentException("Invalid date format for 'dateTo'. Please use 'dd/MM/yyyy'.");
                }
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

            if (agentId > 0)
            {
                sql += " AND s.UserId = @AgentId";
                parameters.Add(new SqlParameter("@AgentId", agentId));
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
                        var sale = new clsSales
                        {
                            SaleId = Convert.ToInt32(dataReader["SaleId"]),
                            ClientId = Convert.ToInt32(dataReader["ClientId"]),
                            ClientName = dataReader["ClientName"].ToString(),
                            SaleDate = dataReader["SaleDate"].ToString(),
                            TotalCost = Convert.ToDecimal(dataReader["TotalCost"]),
                            DriverName = dataReader["DriverName"].ToString(),
                            CarRegNo = dataReader["CarRegNo"].ToString(),
                            Username = dataReader["Username"].ToString(),
                            SaleItems = new List<clsSaleItem>()
                        };

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
                        sales.Add(sale);
                    }
                }
            }
        }

        return sales;
    }

    public static List<clsUserPermission> DisplayUserAgent()  
    {
        List<clsUserPermission> userPermissions = new List<clsUserPermission>();

        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                string sqlUserPermissions = "SELECT UserID, Username FROM UserPermissions";

                using (SqlCommand command = new SqlCommand(sqlUserPermissions, connection))
                {
                    using (SqlDataReader dataReader = command.ExecuteReader())
                    {
                        while (dataReader.Read())
                        {
                            userPermissions.Add(new clsUserPermission
                            {
                                UserID = Convert.ToInt32(dataReader["UserID"]),
                                Username = dataReader["Username"].ToString()
                            });
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions (e.g., log them)
            Console.WriteLine("An error occurred: " + ex.Message);
        }

        return userPermissions;
    }


    public static List<clsClient> DisplayAllClients()
    {
       
        List<clsClient> clients = new List<clsClient>();

        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Using LEFT JOIN to include clients without vehicles
                string sql = "SELECT c.ClientID, c.Name, c.ContactInfo, c.Address, c.BRN, " +
                             "ISNULL(STRING_AGG(v.RegistrationNo, ', '), '') AS RegistrationNos, " +
                             "ISNULL(STRING_AGG(v.DriverName, ', '), '') AS DriverNames " +
                             "FROM Clients c " +
                             "LEFT JOIN Vehicles v ON c.ClientID = v.ClientID " +
                             "GROUP BY c.ClientID, c.Name, c.ContactInfo, c.Address, c.BRN";

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    using (SqlDataReader dataReader = command.ExecuteReader())
                    {
                        while (dataReader.Read())
                        {
                            clients.Add(new clsClient
                            {
                                ClientID = Convert.ToInt32(dataReader["ClientID"]),
                                Name = dataReader["Name"].ToString(),
                                ContactInfo = dataReader["ContactInfo"].ToString(),
                                Address = dataReader["Address" ].ToString(),
                                BRN = dataReader["BRN"].ToString(), // Added BRN
                                RegistrationNo = dataReader["RegistrationNos"].ToString(),
                                DriverName = dataReader["DriverNames"].ToString(),
                            });
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions (e.g., log them)
            Console.WriteLine("An error occurred: " + ex.Message);
        }

        return clients;
    }



    public static List<clsClient> updateClientInfo(int clientId, string name, string contactInfo, string address, string brn)
    {
       
        List<clsClient> clients = new List<clsClient>();

        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Update client information
                string updateSql = "UPDATE Clients SET Name = @Name, ContactInfo = @ContactInfo, Address = @Address, BRN = @BRN WHERE ClientID = @ClientID";

                using (SqlCommand command = new SqlCommand(updateSql, connection))
                {
                    command.Parameters.AddWithValue("@ClientID", clientId);
                    command.Parameters.AddWithValue("@Name", name);
                    command.Parameters.AddWithValue("@ContactInfo", contactInfo);
                    command.Parameters.AddWithValue("@Address", address);
                    command.Parameters.AddWithValue("@BRN", brn);

                    int result = command.ExecuteNonQuery();
                    if (result > 0)
                    {
                        // Retrieve updated client information
                        string selectSql = "SELECT ClientID, Name, ContactInfo, Address, BRN FROM Clients WHERE ClientID = @ClientID";
                        using (SqlCommand selectCommand = new SqlCommand(selectSql, connection))
                        {
                            selectCommand.Parameters.AddWithValue("@ClientID", clientId);
                            using (SqlDataReader dataReader = selectCommand.ExecuteReader())
                            {
                                while (dataReader.Read())
                                {
                                    clients.Add(new clsClient
                                    {
                                        ClientID = Convert.ToInt32(dataReader["ClientID"]),
                                        Name = dataReader["Name"].ToString(),
                                        ContactInfo = dataReader["ContactInfo"].ToString(),
                                        Address = dataReader["Address"].ToString(),
                                        BRN = dataReader["BRN"].ToString()
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions (e.g., log them)
            Console.WriteLine("An error occurred: " + ex.Message);
        }

        return clients;
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

                // Debug logging to check clientInfo content
                

                // Convert necessary fields to the correct types and validate lengths
                int clientId = Convert.ToInt32(clientInfo["ClientId"]);
                string saleDate = clientInfo["date"];  // Use "date" as in the JSON
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



    //Client creation 


    public static List<clsClient> CreateClient(string name, string contactInfo, string address, string brn, List<clsVehicle> vehicles)
    {
        List<clsClient> clients = new List<clsClient>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string insertClientQuery = @"
        INSERT INTO [Shell_POS].[dbo].[Clients] (Name, ContactInfo, Address, BRN) 
        VALUES (@Name, @ContactInfo, @Address, @BRN);
        
        SELECT SCOPE_IDENTITY();"; // This returns the ID of the newly inserted row

            using (SqlCommand insertClientCommand = new SqlCommand(insertClientQuery, connection))
            {
                insertClientCommand.Parameters.AddWithValue("@Name", name);
                insertClientCommand.Parameters.AddWithValue("@ContactInfo", contactInfo);
                insertClientCommand.Parameters.AddWithValue("@Address", address);
                insertClientCommand.Parameters.AddWithValue("@BRN", brn);

                // Execute the insert command and get the new client ID
                int newClientId = Convert.ToInt32(insertClientCommand.ExecuteScalar());

                // Insert vehicle information if provided
                foreach (var vehicle in vehicles)
                {
                    if (!string.IsNullOrEmpty(vehicle.RegistrationNo) && !string.IsNullOrEmpty(vehicle.DriverName) && vehicle.Mileage.HasValue)
                    {
                        string insertVehicleQuery = @"
                    INSERT INTO [Shell_POS].[dbo].[Vehicles] (ClientID, RegistrationNo, DriverName, Mileage) 
                    VALUES (@ClientID, @RegistrationNo, @DriverName, @Mileage)";

                        using (SqlCommand insertVehicleCommand = new SqlCommand(insertVehicleQuery, connection))
                        {
                            insertVehicleCommand.Parameters.AddWithValue("@ClientID", newClientId);
                            insertVehicleCommand.Parameters.AddWithValue("@RegistrationNo", vehicle.RegistrationNo);
                            insertVehicleCommand.Parameters.AddWithValue("@DriverName", vehicle.DriverName);
                            insertVehicleCommand.Parameters.AddWithValue("@Mileage", vehicle.Mileage.Value);

                            insertVehicleCommand.ExecuteNonQuery();
                        }
                    }
                }

                // Retrieve the newly inserted client
                string selectClientQuery = @"
            SELECT ClientID, Name, ContactInfo, Address, BRN
            FROM [Shell_POS].[dbo].[Clients]
            WHERE ClientID = @ClientID";

                using (SqlCommand selectClientCommand = new SqlCommand(selectClientQuery, connection))
                {
                    selectClientCommand.Parameters.AddWithValue("@ClientID", newClientId);

                    using (SqlDataReader dataReader = selectClientCommand.ExecuteReader())
                    {
                        if (dataReader.Read())
                        {
                            clsClient newClient = new clsClient
                            {
                                ClientID = Convert.ToInt32(dataReader["ClientID"]),
                                Name = dataReader["Name"].ToString(),
                                ContactInfo = dataReader["ContactInfo"].ToString(),
                                Address = dataReader["Address"].ToString(),
                                BRN = dataReader["BRN"].ToString()
                            };

                            clients.Add(newClient);
                        }
                    }
                }
            }
        }

        return clients;
    }


    public static bool DeleteSales(int saleId)
    {
      
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            try
            {
                connection.Open();

                // Start a transaction
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    // Delete from SaleItems table first
                    string deleteSaleItemsQuery = @"
                DELETE FROM [Shell_POS].[dbo].[SaleItems]
                WHERE SaleId = @SaleId;";

                    using (SqlCommand deleteSaleItemsCommand = new SqlCommand(deleteSaleItemsQuery, connection, transaction))
                    {
                        deleteSaleItemsCommand.Parameters.AddWithValue("@SaleId", saleId);
                        deleteSaleItemsCommand.ExecuteNonQuery();
                    }

                    // Delete from Sales table
                    string deleteSalesQuery = @"
                DELETE FROM [Shell_POS].[dbo].[Sales]
                WHERE SaleId = @SaleId;";

                    using (SqlCommand deleteSalesCommand = new SqlCommand(deleteSalesQuery, connection, transaction))
                    {
                        deleteSalesCommand.Parameters.AddWithValue("@SaleId", saleId);
                        deleteSalesCommand.ExecuteNonQuery();
                    }

                    // Commit the transaction
                    transaction.Commit();
                }

                return true;
            }
            catch (Exception ex)
            {
                // Log the exception (you can replace this with your logging mechanism)
                Console.WriteLine("Error deleting sales: " + ex.Message);
                return false;
            }
        }
    }



    public static List<clsSales> displayAllClientBasedSales(string dateFrom, string dateTo, string clientId)
    {
        List<clsSales> salesData = new List<clsSales>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string sql = @"
        SELECT 
            c.ClientID, c.Name AS ClientName, c.ContactInfo, c.Address, c.BRN, 
            v.VehicleID, v.RegistrationNo, v.DriverName, v.Mileage,
            s.SaleId, s.SaleDate, s.TotalCost, s.DriverName AS SaleDriverName, s.CarRegNo, s.UserId, s.isCashOrCredit,
            si.SaleItemId, si.ItemId, si.Quantity, si.UnitPrice, si.TotalCost AS ItemTotalCost,
            p.ItemName,
            u.Username
        FROM Clients c
        LEFT JOIN Vehicles v ON c.ClientID = v.ClientID
        LEFT JOIN Sales s ON c.ClientID = s.ClientId
        LEFT JOIN SaleItems si ON s.SaleId = si.SaleId
        LEFT JOIN ProductItems p ON si.ItemId = p.ItemId
        LEFT JOIN UserPermissions u ON s.UserId = u.UserID
        WHERE 1=1"; // Start with a WHERE clause that is always true to simplify appending conditions

            List<SqlParameter> parameters = new List<SqlParameter>();

            if (!string.IsNullOrEmpty(dateFrom))
            {
                DateTime fromDate;
                if (DateTime.TryParseExact(dateFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out fromDate))
                {
                    sql += " AND CONVERT(DATE, s.SaleDate, 103) >= @DateFrom";
                    parameters.Add(new SqlParameter("@DateFrom", fromDate));
                }
                else
                {
                    throw new ArgumentException("Invalid date format for 'dateFrom'. Please use 'dd/MM/yyyy'.");
                }
            }

            if (!string.IsNullOrEmpty(dateTo))
            {
                DateTime toDate;
                if (DateTime.TryParseExact(dateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out toDate))
                {
                    sql += " AND CONVERT(DATE, s.SaleDate, 103) <= @DateTo";
                    parameters.Add(new SqlParameter("@DateTo", toDate));
                }
                else
                {
                    throw new ArgumentException("Invalid date format for 'dateTo'. Please use 'dd/MM/yyyy'.");
                }
            }

            if (!string.IsNullOrEmpty(clientId))
            {
                sql += " AND c.ClientID = @ClientId";
                parameters.Add(new SqlParameter("@ClientId", clientId));
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
                        int saleId = Convert.ToInt32(dataReader["SaleId"]);
                        var sale = salesData.FirstOrDefault(s => s.SaleId == saleId);

                        if (sale == null)
                        {
                            sale = new clsSales
                            {
                                SaleId = saleId,
                                ClientId = Convert.ToInt32(dataReader["ClientId"]),
                                ClientName = dataReader["ClientName"].ToString(),
                                SaleDate = dataReader["SaleDate"].ToString(),
                                TotalCost = Convert.ToDecimal(dataReader["TotalCost"]),
                                DriverName = dataReader["SaleDriverName"].ToString(),
                                CarRegNo = dataReader["CarRegNo"].ToString(),
                                Username = dataReader["Username"].ToString(),
                                SaleItems = new List<clsSaleItem>()
                            };

                            salesData.Add(sale);
                        }

                        if (dataReader["SaleItemId"] != DBNull.Value)
                        {
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
        }

        return salesData;
    }



    public static List<clsPayment> savePayment(string dateFrom, string dateTo, string specificDate, decimal amount, string reference, string comments, int clientId, int paymentTypeId)
    {
        List<clsPayment> payments = new List<clsPayment>();

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string insertPaymentQuery = @"
        INSERT INTO [Shell_POS].[dbo].[Payments] 
        (ClientID, PaymentTypeID, DateFrom, DateTo, SpecificDate, Amount, Reference, Comments, CreatedDate) 
        VALUES 
        (@ClientID, @PaymentTypeID, @DateFrom, @DateTo, @SpecificDate, @Amount, @Reference, @Comments, GETDATE());

        SELECT SCOPE_IDENTITY();"; // This returns the ID of the newly inserted row

            using (SqlCommand insertPaymentCommand = new SqlCommand(insertPaymentQuery, connection))
            {
                insertPaymentCommand.Parameters.AddWithValue("@ClientID", clientId);
                insertPaymentCommand.Parameters.AddWithValue("@PaymentTypeID", paymentTypeId);

                
                if (!string.IsNullOrEmpty(dateFrom))
                {
                    DateTime fromDate = DateTime.ParseExact(dateFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    insertPaymentCommand.Parameters.AddWithValue("@DateFrom", fromDate.ToString("dd/MM/yyyy"));
                }
                else
                {
                    insertPaymentCommand.Parameters.AddWithValue("@DateFrom", DBNull.Value);
                }

               
                if (!string.IsNullOrEmpty(dateTo))
                {
                    DateTime toDate = DateTime.ParseExact(dateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    insertPaymentCommand.Parameters.AddWithValue("@DateTo", toDate.ToString("dd/MM/yyyy"));
                }
                else
                {
                    insertPaymentCommand.Parameters.AddWithValue("@DateTo", DBNull.Value);
                }

             
                if (!string.IsNullOrEmpty(specificDate))
                {
                    DateTime specific = DateTime.ParseExact(specificDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    insertPaymentCommand.Parameters.AddWithValue("@SpecificDate", specific.ToString("dd/MM/yyyy"));
                }
                else
                {
                    insertPaymentCommand.Parameters.AddWithValue("@SpecificDate", DBNull.Value);
                }

                insertPaymentCommand.Parameters.AddWithValue("@Amount", amount);
                insertPaymentCommand.Parameters.AddWithValue("@Reference", reference);
                insertPaymentCommand.Parameters.AddWithValue("@Comments", comments ?? (object)DBNull.Value);

               
                int newPaymentId = Convert.ToInt32(insertPaymentCommand.ExecuteScalar());

                // Retrieve the newly inserted payment
                string selectPaymentQuery = @"
            SELECT PaymentID, ClientID, PaymentTypeID, DateFrom, DateTo, SpecificDate, Amount, Reference, Comments, CreatedDate
            FROM [Shell_POS].[dbo].[Payments]
            WHERE PaymentID = @PaymentID";

                using (SqlCommand selectPaymentCommand = new SqlCommand(selectPaymentQuery, connection))
                {
                    selectPaymentCommand.Parameters.AddWithValue("@PaymentID", newPaymentId);

                    using (SqlDataReader dataReader = selectPaymentCommand.ExecuteReader())
                    {
                        if (dataReader.Read())
                        {
                            clsPayment newPayment = new clsPayment
                            {
                                PaymentID = Convert.ToInt32(dataReader["PaymentID"]),
                                ClientID = Convert.ToInt32(dataReader["ClientID"]),
                                PaymentTypeID = Convert.ToInt32(dataReader["PaymentTypeID"]),
                                DateFrom = dataReader["DateFrom"] != DBNull.Value ? dataReader["DateFrom"].ToString() : null,
                                DateTo = dataReader["DateTo"] != DBNull.Value ? dataReader["DateTo"].ToString() : null,
                                SpecificDate = dataReader["SpecificDate"] != DBNull.Value ? dataReader["SpecificDate"].ToString() : null,
                                Amount = Convert.ToDecimal(dataReader["Amount"]),
                                Reference = dataReader["Reference"].ToString(),
                                Comments = dataReader["Comments"] != DBNull.Value ? dataReader["Comments"].ToString() : null,
                                CreatedDate = dataReader["CreatedDate"].ToString()
                            };

                            payments.Add(newPayment);
                        }
                    }
                }
            }
        }

        return payments;
    }



}



//public int ClientID { get; set; }

//public string Name { get; set; }

//public string ContactInfo { get; set; }

//public string Address { get; set; }

//public string RegistrationNo { get; set; }


//public string DriverName { get; set; }






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





