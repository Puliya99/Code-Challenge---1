package lk.ijse.gdse65.code_challenge_01.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse65.code_challenge_01.backend.dto.ItemDTO;
import lk.ijse.gdse65.code_challenge_01.backend.util.CrudUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.List;


@WebServlet(name = "ItemModel", urlPatterns = "/ItemModel", loadOnStartup = 4)
public class ItemController extends HttpServlet {

    private final static Logger logger = LoggerFactory.getLogger(ItemController.class);

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            List<ItemDTO> items = CrudUtil.getInstance().getAll(ItemDTO.class);
            String jsonItems = objectMapper.writeValueAsString(items);

            resp.setContentType("application/json");
            resp.getWriter().write(jsonItems);
            logger.info("Get All Items");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean isSaved = false;
        try {
            ItemDTO item = objectMapper.readValue(req.getInputStream(), ItemDTO.class);

            isSaved = CrudUtil.getInstance().save(
                    ItemDTO.class,
                    item.getId(),
                    item.getName(),
                    item.getPrice(),
                    item.getQty()
            );

            if(isSaved) {
                logger.info("Item Saved");
            }else {
                logger.info("Item Not Saved");
            }
        } catch (Exception e) {
            logger.error("Item Not Saved");
            e.printStackTrace();
        } finally {
            resp.getWriter().write(isSaved ? "saved" : "not saved");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean isUpdated = false;
        try {
            ItemDTO item = objectMapper.readValue(req.getInputStream(), ItemDTO.class);

            isUpdated = CrudUtil.getInstance().update(
                    ItemDTO.class,
                    item.getName(),
                    item.getPrice(),
                    item.getQty(),
                    item.getId()
            );

            if(isUpdated) {
                logger.info("Item Updated");
            }else {
                logger.info("Item Not Updated");
            }
        } catch (Exception e) {
            logger.error("Item Not Updated");
            e.printStackTrace();
        } finally {
            resp.getWriter().write(isUpdated ? "updated" : "not updated");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        boolean isDeleted = false;
        try {
            isDeleted = CrudUtil.getInstance().deleteItem(
                    req.getParameter("item_code")
            );

            if(isDeleted) {
                logger.info("Item Deleted");
            }else {
                logger.info("Item Not Deleted");
            }
        } catch (Exception e) {
            logger.error("Item Not Deleted");
            e.printStackTrace();
        } finally {
            resp.getWriter().write(isDeleted ? "deleted" : "not deleted");
        }
    }
}
