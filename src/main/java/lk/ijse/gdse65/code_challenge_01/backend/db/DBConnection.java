package lk.ijse.gdse65.code_challenge_01.backend.db;

import javax.naming.InitialContext;
import javax.sql.DataSource;
import java.sql.Connection;

public class DBConnection {
    public static DBConnection dbConnection;
    private Connection connection;

    private DBConnection(){
        try {
            InitialContext context = new InitialContext();
            DataSource lookup = (DataSource) context.lookup("java:comp/env/jdbc/furniture");
            this.connection = lookup.getConnection();
            System.out.println(this.connection);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static DBConnection getInstance(){
        return dbConnection == null ? dbConnection = new DBConnection() : dbConnection;
    }

    public Connection getConnection(){
        return connection;
    }
}
