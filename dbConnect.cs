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


    public string createLogin(string username, string password,string roleid)
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

    public  static string editUser(string username, string password, int RoleId, string PermissionNames, string fname) 
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            

          
            string sql = "UPDATE UserPermissions SET Username = @Username, Password = @Password, RoleId = @RoleId, PermissionNames = @PermissionNames, fname = @fname WHERE Username = @Username";

            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@Username", username);
                command.Parameters.AddWithValue("@Password", password);
                command.Parameters.AddWithValue("@RoleId", RoleId);
                command.Parameters.AddWithValue("@PermissionNames", PermissionNames);
                command.Parameters.AddWithValue("@fname", fname);

                int result = command.ExecuteNonQuery();
                if (result > 0)
                    return "Updated Successfully";
                else
                    return "Error: No rows affected.";
            }





        }


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