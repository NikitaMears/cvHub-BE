const Service = require ('../models/Service');
const {
    createServiceSchema,
    updateServiceSchema,
  } = require('../validations/serviceValidation');
  const { hasPermission } = require('../middlewares/permissionChecker');
exports.getAllServices = async (req, res) => {
  try {
    // const hasAccess = await hasPermission(req, 'getServices');

    // if (!hasAccess) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new service
exports.createService = async (req, res) => {
    const { error } = createServiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

  const { name, price } = req.body;

  try {
    const hasAccess = await hasPermission(req, 'createService');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const service = await Service.create({ name, price });
    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const hasAccess = await hasPermission(req, 'getServices');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};


exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const { error } = updateServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const hasAccess = await hasPermission(req, 'editService');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.name = name;
    service.price = price
    await service.save();

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const hasAccess = await hasPermission(req, 'deleteService');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await service.destroy();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
