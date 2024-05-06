using System;
using System.Data.SqlClient;
using System.Configuration;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
using System.Collections.Generic;
using SezwanPayroll.DTO;

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

            string sql = "SELECT UserId, RoleId, Fname FROM UserPermissions WHERE Username = @Username AND Password = @Password";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@Username", username);
                command.Parameters.AddWithValue("@Password", password);

                dataReader = command.ExecuteReader();

                if (dataReader.Read())
                {
                    if (dataReader.IsDBNull(0) && dataReader.IsDBNull(1) && dataReader.IsDBNull(2))
                    {
                        return null;
                    }
                    else
                    {
                        clsLogin user = new clsLogin();
                        user.UserId = Convert.ToInt32(dataReader["UserId"]);
                        user.RoleId = Convert.ToInt32(dataReader["RoleId"]);
                        user.Fname = dataReader["fname"].ToString();
                        return user;
                    }
                }
                else
                {
                    return null; 
                }
            }
        }
    }

}





