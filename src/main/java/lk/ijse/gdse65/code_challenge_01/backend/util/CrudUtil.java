package lk.ijse.gdse65.code_challenge_01.backend.util;

import lk.ijse.gdse65.code_challenge_01.backend.db.DBConnection;
import lk.ijse.gdse65.code_challenge_01.backend.dto.CustomerDTO;
import lk.ijse.gdse65.code_challenge_01.backend.dto.ItemDTO;
import lk.ijse.gdse65.code_challenge_01.backend.dto.OrderDTO;
import java.lang.reflect.Constructor;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CrudUtil {
    public static CrudUtil crudUtil;

    private final static String GET_CUSTOMERS = "SELECT * FROM Customer";
    private final static String SAVE_CUSTOMER = "INSERT INTO Customer (id, name, address, contact) VALUES (?, ?, ?, ?)";
    private final static String UPDATE_CUSTOMER = "UPDATE Customer SET name = ?, address = ?, contact = ? WHERE id = ?";
    private final static String DELETE_CUSTOMER = "DELETE FROM Customer WHERE id = ?";

    private final static String GET_ITEMS = "SELECT * FROM Item";
    private final static String SAVE_ITEM = "INSERT INTO Item (id, name, price, qty) VALUES (?, ?, ?, ?)";
    private final static String UPDATE_ITEM = "UPDATE Item SET name = ?, price = ?, qty = ? WHERE id = ?";
    private final static String UPDATE_ITEM_QTY = "UPDATE Item SET qty = qty - ? WHERE id = ?";
    private final static String DELETE_ITEM = "DELETE FROM Item WHERE id = ?";

    private final static String GET_ORDERS = "SELECT * FROM order_detail";
    private final static String SAVE_ORDER = "INSERT INTO order_detail (id, date, cusId, discount, total) VALUES (?, ?, ?, ?, ?)";
    private static final String CHECK_CUSTOMER_ORDERS = "SELECT id FROM order_detail WHERE cusId = ? LIMIT 1";
    private static final String DELETE_ORDER_FOR_CUSTOMER = "DELETE FROM order_detail WHERE cusId = ?";

    private final static String GET_ORDER_ITEMS = "SELECT * FROM Order_Item WHERE orderId = ?";
    private final static String CHECK_ORDER_ITEMS_FOR_ITEM = "SELECT * FROM Order_Item WHERE itemCode = ? LIMIT 1";
    private final static String SAVE_ORDER_ITEM = "INSERT INTO Order_Item (orderId, itemCode, qty) VALUES (?, ?, ?)";
    private static final String DELETE_ORDER_ITEMS_FOR_CUSTOMER = "DELETE FROM Order_Item WHERE orderId IN (SELECT id FROM order_detail WHERE cusId = ?)";
    private static final String DELETE_ORDER_ITEMS_FOR_ITEM = "DELETE FROM Order_Item WHERE itemCode = ?";

    private CrudUtil(){}

    public static CrudUtil getInstance(){return crudUtil==null?crudUtil=new CrudUtil():crudUtil;}

    private static <T>T executeQuery(Connection con, String sql, Object... args) throws Exception{
        PreparedStatement ps = con.prepareStatement(sql);
        System.out.println("----- " + sql);

        for (int i = 0; i < args.length; i++) {
            ps.setObject(i + 1, args[i]);
        }

        if(sql.startsWith("SELECT") || sql.startsWith("select")) {
            return (T) ps.executeQuery(); // ResultSet
        }
        return (T) (Boolean)(ps.executeUpdate() > 0); //Boolean
    }

    public <T> List<T> getAll(Class<T> dtoClass, Object... args) throws Exception {
        ResultSet rs = CrudUtil.executeQuery(
                DBConnection.getInstance().getConnection(),
                filterQuery(CrudTypes.GET, dtoClass), args);
        List<T> dtos = new ArrayList<>();

        Constructor<T> constructor = dtoClass.getConstructor(ResultSet.class);

        while (rs.next()) {
            T dto = constructor.newInstance(rs);
            dtos.add(dto);
        }

        return dtos;
    }

    public <T> boolean save(Class<T> dtoClass, Object... args) throws Exception{
        return CrudUtil.executeQuery(
                DBConnection.getInstance().getConnection(),
                filterQuery(CrudTypes.SAVE, dtoClass), args);
    }

    public <T> boolean update(Class<T> dtoClass, Object... args) throws Exception{
        return CrudUtil.executeQuery(
                DBConnection.getInstance().getConnection(),
                filterQuery(CrudTypes.UPDATE, dtoClass), args);
    }

    public <T> boolean delete(Class<T> dtoClass, String id) throws Exception{
        return CrudUtil.executeQuery(
                DBConnection.getInstance().getConnection(),
                filterQuery(CrudTypes.DELETE, dtoClass), id);
    }

    public boolean deleteCustomer(String id) throws  Exception{
        Connection con = DBConnection.getInstance().getConnection();
        try {
            con.setAutoCommit(false);

            ResultSet rs = executeQuery(con, CHECK_CUSTOMER_ORDERS, id);
            if (rs.next()){
                boolean isDelItems = executeQuery(con, DELETE_ORDER_ITEMS_FOR_CUSTOMER, id);
                if(isDelItems){
                    boolean isDelOrders = executeQuery(con, DELETE_ORDER_FOR_CUSTOMER, id);
                    if(isDelOrders){
                        boolean isDelCus = executeQuery(con, DELETE_CUSTOMER, id);
                        if(isDelCus){
                            con.commit();
                            return true;
                        }
                    }
                }else{
                    boolean isDelOrders = executeQuery(con, DELETE_ORDER_FOR_CUSTOMER, id);
                    if(isDelOrders){
                        boolean isDelCus = executeQuery(con, DELETE_CUSTOMER, id);
                        if(isDelCus){
                            con.commit();
                            return true;
                        }
                    }
                }
            }else{
                boolean isDelCus = executeQuery(con, DELETE_CUSTOMER, id);
                if(isDelCus){
                    con.commit();
                    return true;
                }
            }
            con.rollback();
            return false;

        }catch (SQLException e){
            con.rollback();
            e.printStackTrace();
            return false;
        }finally {
            con.setAutoCommit(true);
        }
    }

    public boolean deleteItem(String id) throws Exception{
        Connection con = DBConnection.getInstance().getConnection();
        try {
            con.setAutoCommit(false);

            ResultSet rs = executeQuery(con, CHECK_ORDER_ITEMS_FOR_ITEM, id);
            if(rs.next()){
                boolean isDelItems = executeQuery(con, DELETE_ORDER_ITEMS_FOR_ITEM, id);
                if(isDelItems){
                    if(executeQuery(con, DELETE_ITEM, id)){
                        con.commit();
                        return true;
                    }
                }
            }else{
                if(executeQuery(con, DELETE_ITEM, id)){
                    con.commit();
                    return true;
                }
            }

            con.rollback();
            return false;
        }catch (SQLException e){
            e.printStackTrace();
            con.rollback();
            return false;
        }finally {
            con.setAutoCommit(true);
        }
    }

    public List<OrderDTO> getAllOrders() throws Exception{
        List<OrderDTO> orders = getAll(OrderDTO.class);
        for(OrderDTO order : orders){
            List<ItemDTO> itemDetails = new ArrayList<>();
            ResultSet rs = executeQuery(
                    DBConnection.getInstance().getConnection(),
                    GET_ORDER_ITEMS, order.getId());
            while (rs.next()){
                itemDetails.add(new ItemDTO(rs.getString(2), null, rs.getInt(3), 0));
            }
            order.setItems(itemDetails);
        }
        return orders;
    }

    public boolean saveOrder(List<ItemDTO> items, Object... args) throws Exception{
        Connection con = DBConnection.getInstance().getConnection();
        con.setAutoCommit(false);
        try {
            boolean isOrderSaved = executeQuery(con, SAVE_ORDER, args);
            if(isOrderSaved){
                for(ItemDTO item:items) {
                    boolean saved = orderItemSaveUpdate((String) args[0], item, con);
                    if(!saved){
                        con.rollback();
                        return false;
                    }
                }
                con.commit();
                return true;
            }
            con.rollback();
            return false;
        }catch (Exception e){
            con.rollback();
            e.printStackTrace();
            return false;
        }finally {
            con.setAutoCommit(true);
        }
    }

    private boolean orderItemSaveUpdate(String orderId, ItemDTO item, Connection con) throws Exception{
        boolean saved = executeQuery(con, SAVE_ORDER_ITEM, orderId, item.getId(), item.getQty());
        if(saved) {
            boolean updated = executeQuery(con, UPDATE_ITEM_QTY, item.getQty(), item.getId());
            return true;
        }
        return false;
    }

    private enum CrudTypes{ GET,SAVE,UPDATE,DELETE }

    private <T> String filterQuery(CrudTypes crudType, Class<T> dto){
        if(dto.equals(CustomerDTO.class)){
            switch (crudType){
                case GET: return GET_CUSTOMERS;
                case SAVE: return SAVE_CUSTOMER;
                case UPDATE: return UPDATE_CUSTOMER;
                case DELETE: return DELETE_CUSTOMER;
            }
        }else if(dto.equals(ItemDTO.class)){
            switch (crudType){
                case GET: return GET_ITEMS;
                case SAVE: return SAVE_ITEM;
                case UPDATE: return UPDATE_ITEM;
                case DELETE: return DELETE_ITEM;
            }
        }else if(dto.equals(OrderDTO.class)){
            switch (crudType){
                case GET: return GET_ORDERS;
                case SAVE: return SAVE_ORDER;
            }
        }
        return null;
    }
}
