import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // 🔥 clean DB (order matters)
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.property.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  // 👤 USERS
  const managerIds = Array.from({ length: 5 }, (_, i) => `manager-${i + 1}`);
  const tenantIds = Array.from({ length: 10 }, (_, i) => `tenant-${i + 1}`);

  for (const id of managerIds) {
    await prisma.user.create({
      data: {
        cognitoId: id,
        name: `Manager ${id}`,
        email: `${id}@realtyflow.dev`,
        role: Role.MANAGER,
      },
    });
  }

  for (const id of tenantIds) {
    await prisma.user.create({
      data: {
        cognitoId: id,
        name: `Tenant ${id}`,
        email: `${id}@realtyflow.dev`,
        role: Role.TENANT,
      },
    });
  }

  // 🖼 sample images
  const images = [
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
    "https://images.unsplash.com/photo-1560184897-ae75f418493e",
  ];

  const cities = ["New York", "Los Angeles", "Chicago", "Austin", "Seattle"];
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    "New York": { lat: 40.7128, lng: -74.006 },
    "Los Angeles": { lat: 34.0522, lng: -118.2437 },
    Chicago: { lat: 41.8781, lng: -87.6298 },
    Austin: { lat: 30.2672, lng: -97.7431 },
    Seattle: { lat: 47.6062, lng: -122.3321 },
  };

  // 🏠 PROPERTIES
  for (let i = 1; i <= 20; i++) {
    const city = cities[i % cities.length];
    const base = cityCoords[city];
    const jitter = () => (Math.random() - 0.5) * 0.05;

    const location = await prisma.location.create({
      data: {
        address: `${100 + i} Main St`,
        city,
        state: "State",
        country: "USA",
        postalCode: `100${i}`,
      },
    });

    await prisma.property.create({
      data: {
        name: `${city} Residence ${i}`,
        description: `Modern ${i}-bedroom home in ${city}.`,
        pricePerMonth: 1200 + i * 100,
        securityDeposit: 1000,
        applicationFee: 75,

        photoUrls: [
          images[i % images.length],
          images[(i + 1) % images.length],
        ],

        // ✅ ENUM SAFE
        amenities: [
          "WasherDryer",
          "AirConditioning",
          "HighSpeedInternet",
        ] as any,

        highlights: [
          "HighSpeedInternetAccess",
          "AirConditioning",
        ] as any,

        beds: (i % 4) + 1,
        baths: 1 + (i % 2) * 0.5,
        squareFeet: 700 + i * 30,

        latitude: base ? base.lat + jitter() : null,
        longitude: base ? base.lng + jitter() : null,

        propertyType: "APARTMENT",

        managerId: managerIds[i % managerIds.length],
        locationId: location.id,
      },
    });
  }

  // 📦 GET SOME PROPERTIES
  const properties = await prisma.property.findMany({ take: 5 });

  // 📄 APPLICATIONS
  for (let i = 0; i < properties.length; i++) {
    await prisma.application.create({
      data: {
        propertyId: properties[i].id,
        tenantId: tenantIds[i],

        status:
          i % 3 === 0
            ? "PENDING"
            : i % 2 === 0
            ? "DENIED"
            : "APPROVED",

        personalInfo: {
          name: `Tenant ${i}`,
        },

        financialInfo: {
          income: 5000 + i * 500,
        },
      },
    });
  }

  // 📜 LEASES + 💰 PAYMENTS
  for (let i = 0; i < 3; i++) {
    const lease = await prisma.lease.create({
      data: {
        propertyId: properties[i].id,
        tenantId: tenantIds[i],
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),

        rent: properties[i].pricePerMonth,
        deposit: properties[i].securityDeposit,
      },
    });

    await prisma.payment.create({
      data: {
        leaseId: lease.id,
        amountDue: lease.rent,
        amountPaid: lease.rent,
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentStatus: "PAID",
      },
    });
  }

  // ❤️ FAVORITES
  await prisma.user.update({
    where: { cognitoId: tenantIds[0] },
    data: {
      favorites: {
        connect: properties.slice(0, 3).map((p) => ({ id: p.id })),
      },
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });