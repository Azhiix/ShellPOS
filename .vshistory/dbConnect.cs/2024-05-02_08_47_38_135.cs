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
}
