const Client = require('../models/Client');
const Service = require('../models/Service');
const bcrypt = require('bcrypt');
const ClientService = require('../models/ClientService');
const {
    createClientSchema,
    updateClientSchema,
  } = require('../validations/clientValidation');
  const { hasPermission } = require('../middlewares/permissionChecker');
const { v4: uuidv4 } = require('uuid');
exports.getAllClientsWithServices = async (req, res) => {
  try {
    const hasAccess = await hasPermission(req, 'createClient');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const clients = await Client.findAll({
      attributes: { exclude: ['password'] },
      include: {
        model: Service,
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
      
      
    });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createClient = async (req, res) => {
    const { error } = createClientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name, email, paymentStatus, serviceIds } = req.body;
    const hashedPassword = await bcrypt.hash('password', 10);
    try {
        const hasAccess = await hasPermission(req, 'createClient');

        if (!hasAccess) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      const apiKey = uuidv4();
  
      const client = await Client.create({
      name:  name,
      email:  email,
      apiKey:  apiKey,
       paymentStatus: paymentStatus,
      password:  hashedPassword
        
      });
      const clientId = client.id;
       if (serviceIds && serviceIds.length > 0) {
        const clientServices = serviceIds.map(serviceId => ({
          ClientId: clientId,
          ServiceId: serviceId,
          status: 'Active'
        }));
        await ClientService.bulkCreate(clientServices);
     
      }
      res.status(201).json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create client' });
    }
  };
  
  


exports.getClientByIdWithServices = async (req, res) => {
  const { id } = req.params;

  try {
    const hasAccess = await hasPermission(req, 'getClients');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const client = await Client.findByPk(id, {
      include: {
        model: Service,
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, paymentStatus, serviceIds, status } = req.body;
  const { error } = updateClientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const hasAccess = await hasPermission(req, 'getClients');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.name = name;
    client.email = email;
    client.status = status;
    // client.apiKey = apiKey;
    client.paymentStatus = paymentStatus;
    await client.save();
    await ClientService.destroy({ where: { ClientId: client.id } });

    // Associate the permissions with the role
    const clientId = client.id;
    if (serviceIds && serviceIds.length > 0) {
      const clientServices = serviceIds.map(serviceId => ({
        ClientId: clientId,
        ServiceId: serviceId.id,
        status: serviceId.status
      }));
      await ClientService.bulkCreate(clientServices);
   
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};



exports.deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const hasAccess = await hasPermission(req, 'deleteClient');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.destroy();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};
exports.changeClientPassword = async (req, res) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const id = req.params.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  


  try {
    // Find the user by email
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'User not found' });
    }

    if(newPassword != confirmPassword){
      return res.status(400).json({ error: 'Password and Confirmation password are not the same.' });

    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, client.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    client.password = hashedPassword;
    
    await client.save();
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'minasmelaku@gmail.com',
        pass: 'sxmbwmvwdcftismt' 
      }
    });

    let mailOptions = {
      from: 'minasmelaku@gmail.com',
      to: user.email,
      subject: 'Your password is changed.!',
      html: `
      <body style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; padding: 10px; background-color: #f2f2f2;">

  <header style="background-color: #333; color: white; padding: 1rem;">
    <h1 style="font-size: 24px; margin: 0;">Time to Change Your Password!</h1> 
  </header>

  <main style="background-color: white; padding: 1rem; border-radius: 5px;">
    <p style="font-size: 18px; font-weight: bold;">Dear User,</p>

    <p>Your password for yeha maps us changed. 
    
   
    <p>For your security, it's important that you notify you when your password is changed.</p>

    <p>Best Regards,<br>Yeha Team</p>
  </main>
  
  <footer style="background-color: #333; color: white; padding: 0.5rem; text-align: center; font-size: 0.85rem;">
    &copy; 2023 Yeha Maps
  </footer>

</body>
    ` 
    };
    return res.status(201).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}


exports.clientLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user based on the phone number
    const client = await Client.findOne({ where: { email } });

    if (!client) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
 

 

    const token = jwt.sign({ id: client.id }, config.jwtSecret, { expiresIn: '1h' });
    console.log('Generated token:', token);

    res.status(200).json({ client, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.clientProfile = async (req, res) => {
  const { id } = req.params;

  try {
  
    const client = await Client.findByPk(id, {
      include: {
        model: Service,
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

exports.cancelServiceSubscription = async (req, res) => {
  const { id } = req.params;
  const {serviceId} = req.body;

  try {
  
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const clientService = await ClientService.findOne({ where: { clientId: id, serviceId: serviceId } });
    if (!clientService) {
      return res.status(404).json({ error: ' service not found' });
    }
    clientService.status = 'Cancelled';
    await  clientService.save();

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};




exports.regenerateAPIKey = async (req, res) => {
  const { id } = req.params;

  try {
  
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const apiKey = uuidv4();
    client.apiKey = apiKey;
    await client.save();
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};
