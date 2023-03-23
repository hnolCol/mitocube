import React, { useState } from 'react';
import { motion } from 'framer-motion';


const Navigation = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const navItems = [
    {
      id: 1,
      text: 'Header 1',
      subItems: [
        { id: 1, text: 'Subheader 1' },
        { id: 2, text: 'Subheader 2' },
        { id: 3, text: 'Subheader 3' },
      ],
    },
    {
      id: 2,
      text: 'Header 2',
      subItems: [{ id: 1, text: 'Subheader 1' }],
    },
    {
      id: 3,
      text: 'Header 3',
      subItems: [
        { id: 1, text: 'Subheader 1' },
        {
          id: 2,
          text: 'Subheader 2',
          subItems: [{ id: 1, text: 'Sub-subheader 1' }],
        },
        { id: 3, text: 'Subheader 3' },
      ],
    },
  ];

  const navVariants = {
    open: { x: 0 },
    minimized: { x: '-100%' },
  };

  const navItemVariants = {
    open: { x: 0, opacity: 1 },
    minimized: { x: '-100%', opacity: 0 },
  };

  const NavItem = ({ item, level }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div className={`nav-item level-${level}`}>
        <motion.div
          className="nav-item-text"
          variants={navItemVariants}
          whileHover={{ scale: 1.1 }}
        >
          {item.text}
        </motion.div>
        {hasSubItems && (
          <motion.div
            className="nav-subitems"
            variants={navItemVariants}
            initial="minimized"
            animate={isMinimized ? 'minimized' : 'open'}
          >
            {item.subItems.map((subItem) => (
              <NavItem item={subItem} level={level + 1} key={subItem.id} />
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.nav
      className={`navigation ${isMinimized ? 'minimized' : ''}`}
      variants={navVariants}
      initial="minimized"
      animate={isMinimized ? 'minimized' : 'open'}
    >
      <div className="nav-toggle" onClick={toggleMinimized}>
        {isMinimized ? '>' : '<'}
      </div>
      <div className="nav-items">
        {navItems.map((item) => (
          <NavItem item={item} level={1} key={item.id} />
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;
