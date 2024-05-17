using System;
using System.Data.SqlClient;
using System.Configuration;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
using System.Collections.Generic;
using SezwanPayroll.DTO;
using System.EnterpriseServices;
using System.Security.Cryptography.X509Certificates;

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

                dataReader = command.ExecuteReader();

                if (dataReader.Read())
                {

                    if (!dataReader.IsDBNull(0) && !dataReader.IsDBNull(1) && !dataReader.IsDBNull(2))
                    {
                        clsLogin user = new clsLogin
                        {
                            UserId = Convert.ToInt32(dataReader["UserId"]),
                            RoleId = Convert.ToInt32(dataReader["RoleId"]),
                            Fname = dataReader["fname"].ToString()
                        };
                        return user;
                    }
                }
                return null;
            }
        }
    }



    public string createLogin(string username, string password, string roleid)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            try
            {
                connection.Open();
                string sql = "INSERT INTO UserPermissions (Username, Password, RoleId) VALUES (@Username, @Password, @RoleId)";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Password", password);
                    command.Parameters.AddWithValue("@RoleId", roleid);


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



    public static List<clsSales> RecordSales(string dateFrom, string dateTo, string client, string vehicleRegNo)
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
                s.CarRegNo
            FROM Sales s
            JOIN Clients c ON s.ClientId = c.ClientID
            WHERE 1=1"; 

           
            List<SqlParameter> parameters = new List<SqlParameter>();

            if (!string.IsNullOrEmpty(dateFrom))
            {
                sql += " AND s.SaleDate >= @DateFrom";
                parameters.Add(new SqlParameter("@DateFrom", dateFrom));
            }

            if (!string.IsNullOrEmpty(dateTo))
            {
                sql += " AND s.SaleDate <= @DateTo";
                parameters.Add(new SqlParameter("@DateTo", dateTo));
            }

            if (!string.IsNullOrEmpty(client))
            {
                sql += " AND c.Name = @Client";
                parameters.Add(new SqlParameter("@Client", client));
            }

            if (!string.IsNullOrEmpty(vehicleRegNo))
            {
                sql += " AND s.CarRegNo = @VehicleRegNo";
                parameters.Add(new SqlParameter("@VehicleRegNo", vehicleRegNo));
            }

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                // Add parameters to the command
                foreach (var parameter in parameters)
                {
                    command.Parameters.Add(parameter);
                }

                using (SqlDataReader dataReader = command.ExecuteReader())
                {
                    while (dataReader.Read())
                    {
                        sales.Add(new clsSales
                        {
                            SaleId = Convert.ToInt32(dataReader["SaleId"]),
                            ClientId = Convert.ToInt32(dataReader["ClientId"]),
                            ClientName = dataReader["ClientName"].ToString(),
                            SaleDate = Convert.ToDateTime(dataReader["SaleDate"]),
                            TotalCost = Convert.ToDecimal(dataReader["TotalCost"]),
                            DriverName = dataReader["DriverName"].ToString(),
                            CarRegNo = dataReader["CarRegNo"].ToString()
                        });
                    }
                }
            }
        }




        return sales;
    }


}













//UserID Username	Password	RoleId	PermissionNames	fname
//1	user	user2	1	Read, Write	Luke Curtis
//2	admin	admin	2	NULL	Azhar
//3	Lucas	curtis	1	NULL	NULL
//4	admintest	test	1	NULL	NULL
//5	testadminnew	test	2	NULL	NULL
//6			1	NULL	NULL
//7	test100	user	2	NULL	NULL
//8	lukecurtis	luke	2	NULL	NULL