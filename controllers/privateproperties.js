import { PrivateProperty } from "../model/privateproperties.js";

const defaultHouseImages = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c",
];

const getRandomHouseImage = () => {
  const randomIndex = Math.floor(Math.random() * defaultHouseImages.length);
  return defaultHouseImages[randomIndex];
};

const ensurePropertyImage = (property) => {
  if (!property.image || property.image.trim() === "") {
    property.image = getRandomHouseImage();
  }
  return property;
};

export const getPrivateProperties = async (req, res) => {
  try {
    let query = { status: "private" };

    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    const properties = await PrivateProperty.find(query);

    const formattedProperties = properties.map((property) => {
      const propertyObj = property.toObject();
      if (!propertyObj.image || propertyObj.image.trim() === "") {
        propertyObj.image = getRandomHouseImage();
      }

      if (propertyObj.images && propertyObj.images.length === 0) {
        propertyObj.images = [propertyObj.image];
      }

      return {
        _id: property._id,
        Area: property.Area,
        areaUnit: property.areaUnit,
        TotalArea: property.TotalArea,
        description: property.description,
        image: propertyObj.image,
        images: propertyObj.images,
        video: property.video,
        price: property.price,
        priceUnit: property.priceUnit,
        location: property.location,
        category: property.category,
        beds: property.beds,
        Bath: property.Bath,
        title: property.title,
        city: property.city,
        timeRequirement: property.timeRequirement,
        minPrice: property.minPrice,
        maxPrice: property.maxPrice,
        buyOrRent: property.buyOrRent,
        senderName: property.senderName,
        portionCategory: property.portionCategory,
        propertyDealerName: property.propertyDealerName,
        propertyDealerEmail: property.propertyDealerEmail,
        phone: property.phone,
        status: property.status,
        userId: property.userId,
        createdAt: property.createdAt?.toISOString(),
        updatedAt: property.updatedAt?.toISOString(),
      };
    });

    res.json({
      message: "Private properties fetched successfully",
      data: formattedProperties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching private properties",
    });
  }
};

export const getPrivatePropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await PrivateProperty.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Private property not found" });
    }

    const propertyObj = property.toObject();
    if (!propertyObj.image || propertyObj.image.trim() === "") {
      propertyObj.image = getRandomHouseImage();
    }

    if (propertyObj.images && propertyObj.images.length === 0) {
      propertyObj.images = [propertyObj.image];
    }

    const formattedProperty = {
      _id: property._id,
      Area: property.Area,
      areaUnit: property.areaUnit,
      TotalArea: property.TotalArea,
      description: property.description,
      image: propertyObj.image,
      images: propertyObj.images,
      video: property.video,
      title: property.title,
      price: property.price,
      priceUnit: property.priceUnit,
      location: property.location,
      category: property.category,
      beds: property.beds,
      status: property.status,
      Bath: property.Bath,
      city: property.city,
      timeRequirement: property.timeRequirement,
      minPrice: property.minPrice,
      maxPrice: property.maxPrice,
      buyOrRent: property.buyOrRent,
      senderName: property.senderName,
      portionCategory: property.portionCategory,
      propertyDealerName: property.propertyDealerName,
      propertyDealerEmail: property.propertyDealerEmail,
      phone: property.phone,
      userId: property.userId,
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString(),
    };

    res.json({
      message: "Private property fetched successfully",
      data: formattedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching private property by ID",
    });
  }
};

export const createPrivateProperty = async (req, res) => {
  try {
    let images = [];
    if (req.files?.images) {
      images = req.files.images.map((file) => `/uploads/${file.filename}`);
    }

    let video = "";
    if (req.files?.video) {
      video = `/uploads/${req.files.video[0].filename}`;
    }

    const newProperty = await PrivateProperty.create({
      ...req.body,
      phone: req.body.phone || "",
      title: req.body.title || "",
      senderName: req.body.senderName || "",
      status: "private",
      image: images[0] || getRandomHouseImage(),
      images: images.length > 0 ? images : [getRandomHouseImage()],
      video: video,
      minPrice: req.body.minPrice || "",
      maxPrice: req.body.maxPrice || "",
      portionCategory: req.body.portionCategory || "",
      phone: req.body.phone || null,
      userId: req.body.userId || null,
    });

    res.status(201).json({
      message: "Private property created successfully",
      data: newProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePrivateProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const updateData = {
      ...req.body,
    };

    if (req.files?.images) {
      updateData.images = req.files.images.map(
        (file) => `/uploads/${file.filename}`
      );
      updateData.image = updateData.images[0] || getRandomHouseImage();
    }

    if (req.files?.video) {
      updateData.video = `/uploads/${req.files.video[0].filename}`;
    }

    const updatedProperty = await PrivateProperty.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Private property not found" });
    }

    res.json({
      message: "Private property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while updating private property",
    });
  }
};

export const deletePrivateProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProperty = await PrivateProperty.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({ message: "Private property not found" });
    }

    res.json({
      message: "Private property deleted successfully",
      data: deletedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while deleting private property",
    });
  }
};

export const patchPrivateProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const updateData = { ...req.body };

    if (req.files?.images) {
      updateData.images = req.files.images.map(
        (file) => `/uploads/${file.filename}`
      );
      updateData.image = updateData.images[0] || getRandomHouseImage();
    }

    if (req.files?.video) {
      updateData.video = `/uploads/${req.files.video[0].filename}`;
    }

    const updatedProperty = await PrivateProperty.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Private property not found" });
    }

    res.json({
      message: "Private property patched successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while patching private property",
    });
  }
};
