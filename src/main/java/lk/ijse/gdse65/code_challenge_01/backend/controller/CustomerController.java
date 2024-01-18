package lk.ijse.gdse65.code_challenge_01.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse65.code_challenge_01.backend.dto.CustomerDTO;
import lk.ijse.gdse65.code_challenge_01.backend.util.CrudUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "CustomerModel", urlPatterns = "/CustomerModel", loadOnStartup = 4)
public class CustomerController extends HttpServlet {

    private final static Logger logger = LoggerFactory.getLogger(CustomerController.class);

    private ObjectMapper objectMapper = new ObjectMapper();
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            List<CustomerDTO> customers = CrudUtil.getInstance().getAll(CustomerDTO.class);
            String jsonCustomers = objectMapper.writeValueAsString(customers);

            resp.setContentType("application/json");
            resp.getWriter().write(jsonCustomers);
            logger.info("Get All Customers");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Jsonb jsonb = JsonbBuilder.create();
        CustomerDTO customerDTO = jsonb.fromJson(req.getReader(), CustomerDTO.class);

        System.out.println(customerDTO.getId());
        System.out.println(customerDTO.getName());
        System.out.println(customerDTO.getAddress());
        System.out.println(customerDTO.getContact());
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean isUpdated = false;
        try {
            CustomerDTO customer = objectMapper.readValue(req.getInputStream(), CustomerDTO.class);

            isUpdated = CrudUtil.getInstance().update(
                    CustomerDTO.class,
                    customer.getName(),
                    customer.getAddress(),
                    customer.getContact(),
                    customer.getId()
            );

            if(isUpdated) {
                logger.info("Customer Updated");
            }else {
                logger.info("Customer Not Updated");
            }
        } catch (Exception e) {
            logger.error("Customer Not Updated");
            e.printStackTrace();
        }finally {
            resp.getWriter().write(isUpdated ? "updated" : "not updated");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean isDeleted = false;
        try {
            isDeleted = CrudUtil.getInstance().deleteCustomer(req.getParameter("cus_id"));

            if(isDeleted) {
                logger.info("Customer Deleted");
            }else {
                logger.info("Customer Not Deleted");
            }
        } catch (Exception e) {
            logger.error("Customer Not Deleted");
            e.printStackTrace();
        } finally {
            resp.getWriter().write(isDeleted ? "deleted" : "not deleted");
        }
    }
}
