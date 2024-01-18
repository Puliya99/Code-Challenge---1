package lk.ijse.gdse65.code_challenge_01.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse65.code_challenge_01.backend.dto.OrderDTO;
import lk.ijse.gdse65.code_challenge_01.backend.util.CrudUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "OrderModel", urlPatterns = "/OrderModel", loadOnStartup = 4)
public class OrderController extends HttpServlet {

    private final static Logger logger = LoggerFactory.getLogger(OrderController.class);

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            List<OrderDTO> allOrders = CrudUtil.getInstance().getAllOrders();
            String jsonOrders = objectMapper.writeValueAsString(allOrders);

            resp.setContentType("application/json");
            resp.getWriter().write(jsonOrders);
            logger.info("Get All Orders");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean isSaved = false;
        try {
            objectMapper.registerModule(new JavaTimeModule());
            OrderDTO orderDTO = objectMapper.readValue(req.getInputStream(), OrderDTO.class);
            isSaved = CrudUtil.getInstance().saveOrder(
                    orderDTO.getItems(),
                    orderDTO.getId(),
                    orderDTO.getDate(),
                    orderDTO.getCusId(),
                    orderDTO.getDiscount(),
                    orderDTO.getTotal()
            );

            if(isSaved){
                logger.info("Order Saved");
            }else{
                logger.info("Order Not Saved");
            }
        }catch (Exception e){
            logger.error("Order Not Saved");
            e.printStackTrace();
        } finally {
            resp.getWriter().write(isSaved ? "saved" : "not saved");
        }
    }
}
