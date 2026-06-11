import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    brand: { select: { name: true } };
    images: { where: { isPrimary: true }; take: 1 };
  };
}>;

type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    customer: { select: { firstName: true; lastName: true } };
    product: { select: { name: true; slug: true } };
  };
}>;

interface HomepageData {
  heroBanners: Prisma.HeroBannerGetPayload<Record<string, never>>[];
  featuredProducts: ProductWithRelations[];
  trendingProducts: ProductWithRelations[];
  newArrivals: ProductWithRelations[];
  bestSellers: ProductWithRelations[];
  categories: Prisma.CategoryGetPayload<Record<string, never>>[];
  brands: Prisma.BrandGetPayload<Record<string, never>>[];
  reviews: ReviewWithRelations[];
  homepageSettings: Prisma.HomepageSettingGetPayload<Record<string, never>>[];
}

const emptyHomepageData: HomepageData = {
  heroBanners: [],
  featuredProducts: [],
  trendingProducts: [],
  newArrivals: [],
  bestSellers: [],
  categories: [],
  brands: [],
  reviews: [],
  homepageSettings: [],
};

export async function getHomepageData() {
  try {
    const [
      heroBanners,
      featuredProducts,
      trendingProducts,
      newArrivals,
      bestSellers,
      categories,
      brands,
      reviews,
      homepageSettings
    ] = await Promise.all([
      prisma.heroBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" }
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: {
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 }
        },
        take: 8,
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isTrending: true },
        include: {
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 }
        },
        take: 8
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isNewArrival: true },
        include: {
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 }
        },
        take: 8,
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isBestSeller: true },
        include: {
          brand: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 }
        },
        take: 8
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        take: 8
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 12
      }),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          product: { select: { name: true, slug: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 6
      }),
      prisma.homepageSetting.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" }
      })
    ]);

    return {
      heroBanners,
      featuredProducts,
      trendingProducts,
      newArrivals,
      bestSellers,
      categories,
      brands,
      reviews,
      homepageSettings
    };
  } catch (err) {
    console.error(err);
    return emptyHomepageData;
  }
}
