const express = require('express');
const router = express.Router();
const { Menu, SubMenu, HeaderConfig, sequelize } = require('../models/Menu');

// Get header configuration
router.get('/config', async (req, res) => {
  try {
    const config = await HeaderConfig.findOne();
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching header config' });
  }
});

// Update header configuration
router.put('/config', async (req, res) => {
  try {
    console.log('[API] Received Header Config Update:', req.body);
    const { logoTitle, logoSubtitle, logoUrl, searchPlaceholder, accountTopText, accountBottomText, homeLink, homeIconName, showHeader } = req.body;
    const config = await HeaderConfig.findOne();
    console.log('[API] Current Config in DB:', config ? 'Found' : 'Not Found');
    if (config) {
      await config.update({ logoTitle, logoSubtitle, logoUrl, searchPlaceholder, accountTopText, accountBottomText, homeLink, homeIconName, showHeader });
      res.json(config);
    } else {
      const newConfig = await HeaderConfig.create({ logoTitle, logoSubtitle, logoUrl, searchPlaceholder, accountTopText, accountBottomText, homeLink, homeIconName, showHeader });
      res.json(newConfig);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating header config' });
  }
});

// Get all menus with their submenus
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll({
      include: [{ model: SubMenu, as: 'subItems' }],
      order: [['position', 'ASC']],
    });
    
    // Format response to match frontend expectations
    const formattedMenus = menus.map(menu => {
        const plainMenu = menu.get({ plain: true });
        return {
            ...plainMenu,
            submenus: plainMenu.subItems ? plainMenu.subItems.length : 0
        };
    });

    res.json(formattedMenus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching menus' });
  }
});

// Create a new menu
router.post('/', async (req, res) => {
  try {
    const { 
      name, type, status, position, link, 
      collectionTitle, collectionSubtitle, collectionDescription, collectionBadgeText,
      megaMenuTitle, featuredImageUrl, specimenId, specimenTitle, hideMegaMenu 
    } = req.body;
    
    // Auto calculate position if not provided
    let newPos = position;
    if (newPos === undefined) {
        const maxPosMenu = await Menu.findOne({ order: [['position', 'DESC']] });
        newPos = maxPosMenu ? maxPosMenu.position + 1 : 1;
    }

    const menu = await Menu.create({ 
      name, type, status, position: newPos, link,
      collectionTitle, collectionSubtitle, collectionDescription, collectionBadgeText,
      megaMenuTitle, featuredImageUrl, specimenId, specimenTitle, hideMegaMenu
    });
    res.status(201).json({ ...menu.get({ plain: true }), submenus: 0, subItems: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating menu' });
  }
});

// Update a menu
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, type, status, position, link,
      collectionTitle, collectionSubtitle, collectionDescription, collectionBadgeText,
      megaMenuTitle, featuredImageUrl, specimenId, specimenTitle, hideMegaMenu
    } = req.body;
    const menu = await Menu.findByPk(req.params.id);
    
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    
    await menu.update({ 
      name, type, status, position, link,
      collectionTitle, collectionSubtitle, collectionDescription, collectionBadgeText,
      megaMenuTitle, featuredImageUrl, specimenId, specimenTitle, hideMegaMenu
    });
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating menu' });
  }
});

// Delete a menu
router.delete('/:id', async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    
    await menu.destroy();
    res.json({ message: 'Menu deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting menu' });
  }
});

// Reorder menus
router.post('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body; // Array of menu IDs in the new order
    
    // Update positions transactionally
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await Menu.update({ position: i }, { where: { id: orderedIds[i] }, transaction: t });
      }
    });

    res.json({ message: 'Menus reordered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reordering menus' });
  }
});

// Get submenus for a specific menu
router.get('/:menuId/submenus', async (req, res) => {
    try {
      const subMenus = await SubMenu.findAll({
        where: { menuId: req.params.menuId },
        order: [['position', 'ASC']],
      });
      res.json(subMenus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching submenus' });
    }
  });
  
// Create a submenu
router.post('/:menuId/submenus', async (req, res) => {
try {
    const { name, position, link, status, listHeader } = req.body;
    const menuId = req.params.menuId;
    
    // Auto calculate position if not provided
    let newPos = position;
    if (newPos === undefined) {
        const maxPosSub = await SubMenu.findOne({ where: { menuId }, order: [['position', 'DESC']] });
        newPos = maxPosSub ? maxPosSub.position + 1 : 0;
    }

    const targetHeader = listHeader || 'Top Categories';

    // Validation: Check if there are already 10 submenus in this category
    const count = await SubMenu.count({
        where: {
            menuId: menuId,
            listHeader: targetHeader
        }
    });

    if (count >= 10) {
        return res.status(400).json({ message: `Maximum 10 submenus allowed in "${targetHeader}".` });
    }

    const submenu = await SubMenu.create({ name, position: newPos, link, status: status || 'active', menuId, listHeader: targetHeader });
    res.status(201).json(submenu);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating submenu' });
}
});

// Update a submenu
router.put('/submenus/:id', async (req, res) => {
try {
    const { name, position, link, status, listHeader } = req.body;
    const submenu = await SubMenu.findByPk(req.params.id);
    
    if (!submenu) return res.status(404).json({ message: 'Submenu not found' });
    
    const targetHeader = listHeader || submenu.listHeader || 'Top Categories';
    
    // Validation: If changing category, check if new category already has 10 submenus
    if (listHeader && listHeader !== submenu.listHeader) {
        const count = await SubMenu.count({
            where: {
                menuId: submenu.menuId,
                listHeader: targetHeader
            }
        });

        if (count >= 10) {
            return res.status(400).json({ message: `Maximum 10 submenus allowed in "${targetHeader}".` });
        }
    }

    await submenu.update({ name, position, link, status, listHeader: targetHeader });
    res.json(submenu);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating submenu' });
}
});

// Delete a submenu
router.delete('/submenus/:id', async (req, res) => {
try {
    const submenu = await SubMenu.findByPk(req.params.id);
    if (!submenu) return res.status(404).json({ message: 'Submenu not found' });
    
    await submenu.destroy();
    res.json({ message: 'Submenu deleted' });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting submenu' });
}
});

// Reorder submenus
router.post('/:menuId/submenus/reorder', async (req, res) => {
try {
    const { orderedIds } = req.body;
    const menuId = req.params.menuId;
    
    await sequelize.transaction(async (t) => {
        for (let i = 0; i < orderedIds.length; i++) {
            await SubMenu.update({ position: i }, { where: { id: orderedIds[i], menuId }, transaction: t });
        }
    });

    res.json({ message: 'Submenus reordered successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reordering submenus' });
}
});

module.exports = router;
