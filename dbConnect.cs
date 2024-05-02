using System;
using System.Data.SqlClient;
using System.Configuration;

public class DbConnect
{
    private SqlConnection conn;

    public DbConnect()
    {
        string connectionString = ConfigurationManager.ConnectionStrings["SezwanPOS"].ConnectionString;
        conn = new SqlConnection(connectionString);
    }

    public bool TestConnection()
    {
        try
        {
            conn.Open();
            return true;
        }
        catch (Exception)
        {
            return false;
        }
        finally
        {
            if (conn.State == System.Data.ConnectionState.Open)
                conn.Close();
        }
    }


    public bool Login(string username, string password)
    {
        try
        {
            conn.Open();
            SqlCommand cmd = new SqlCommand("SELECT * FROM Users WHERE Username = @username AND Password = @password", conn);
            cmd.Parameters.AddWithValue("@username", username);
            cmd.Parameters.AddWithValue("@password", password);
            SqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
                return true;
            else
                return false;
        }
        catch (Exception)
        {
            return false;
        }
        finally
        {
            if (conn.State == System.Data.ConnectionState.Open)
                conn.Close();
        }
    }   
}
