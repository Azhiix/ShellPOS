using System;
using System.Data.SqlClient;
using System.Configuration;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
using System.Collections.Generic;

public class DbConnect
{
    private SqlConnection conn;

    static string connectionString = ConfigurationManager.ConnectionStrings["POS Database"].ConnectionString;


    public static int ValidateLogin(string username, string password)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {

            connection.Open(); 
            SqlDataReader dataReader;
            int userId = 0;

            string sql = "SELECT [RoleId] FROM UserPermissions WHERE Username = @Username AND Password = @Password";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {

                command.Parameters.AddWithValue("@Username", username);
                command.Parameters.AddWithValue("@Password", password);

                dataReader = command.ExecuteReader();

                if (dataReader.Read()) userId = dataReader.IsDBNull(0) ? 0 : Convert.ToInt32(dataReader.GetValue(0));
                else return 0;
                
                return userId;
            }
        }
    }
}





