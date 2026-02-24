const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/references/operations
router.get('/operations', async (req, res) => {
  const ops = await prisma.operation.findMany({ select: { id: true, name: true } });
  res.json({ success: true, data: ops });
});

// GET /api/references/property-types
router.get('/property-types', async (req, res) => {
  const types = await prisma.propertyType.findMany({ select: { id: true, name: true } });
  res.json({ success: true, data: types });
});

// GET /api/references/housing-types
router.get('/housing-types', async (req, res) => {
  const housing = await prisma.housingType.findMany({ 
    select: { 
      id: true, 
      name: true, 
      propertyTypeId: true   // <-- добавляем это поле
    } 
  });
  res.json({ success: true, data: housing });
});

module.exports = router;