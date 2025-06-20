import { eq, and, or, like, desc, asc, count, gt } from "drizzle-orm";
import { db } from "@/server/db";
import { attachments, documents, employees, users } from "@/server/db/schema";
import type { DocumentFilters } from "@/modules/documents/schemas";
import type {
  documentTypeEnum,
  documentVisibilityEnum,
} from "@/server/db/documents";
import { TRPCError } from "@trpc/server";
import { AttachmentService } from "./attachment.service";

type DocumentType = (typeof documentTypeEnum.enumValues)[number];
type DocumentVisibility = (typeof documentVisibilityEnum.enumValues)[number];

export class DocumentsService {
  static async create(input: {
    title: string;
    description: string;
    type: DocumentType;
    visibility: DocumentVisibility;
    uploadedBy: string;
    employeeId?: string;
    attachmentId: string;
  }) {
    const [document] = await db
      .insert(documents)
      .values({
        title: input.title,
        description: input.description,
        type: input.type,
        visibility: input.visibility,
        employeeId: input.employeeId || null,
        uploadedBy: input.uploadedBy,
        attachmentId: input.attachmentId,
      })
      .returning();

    if (!document) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create document",
      });
    }

    const attachment = await AttachmentService.getAttachmentById(
      input.attachmentId,
    );

    return { document, attachment };
  }

  static async update(input: {
    id: string;
    title?: string;
    description?: string;
    type?: DocumentType;
    visibility?: DocumentVisibility;
    employeeId?: string;
    isActive?: boolean;
  }) {
    const updateData: Partial<typeof documents.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.visibility !== undefined)
      updateData.visibility = input.visibility;
    if (input.employeeId !== undefined)
      updateData.employeeId = input.employeeId || null;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const [document] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, input.id))
      .returning();

    return document;
  }

  static async findById(id: string) {
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        type: documents.type,
        visibility: documents.visibility,
        employeeId: documents.employeeId,
        isActive: documents.isActive,
        uploadedBy: documents.uploadedBy,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        employee: {
          id: employees.id,
          designation: employees.designation,
          department: employees.department,
        },
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        attachment: {
          id: attachments.id,
          fullPath: attachments.fullPath,
        },
      })
      .from(documents)
      .leftJoin(employees, eq(documents.employeeId, employees.id))
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .leftJoin(attachments, eq(documents.attachmentId, attachments.id))
      .where(eq(documents.id, id))
      .limit(1);

    if (!result[0]) return null;

    return result[0];
  }

  static async findMany(
    filters: DocumentFilters & {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      createdAfter?: Date;
    } = {
      limit: 20,
      offset: 0,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  ) {
    const {
      type,
      visibility,
      search,
      employeeId,
      isActive = true,
      uploadedBy,
      limit = 20,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
      createdAfter,
    } = filters;

    // Build where conditions
    const whereConditions = [eq(documents.isActive, isActive)];

    if (type) {
      whereConditions.push(eq(documents.type, type));
    }

    if (visibility) {
      whereConditions.push(eq(documents.visibility, visibility));
    }

    if (employeeId) {
      whereConditions.push(eq(documents.employeeId, employeeId));
    }

    if (uploadedBy) {
      whereConditions.push(eq(documents.uploadedBy, uploadedBy));
    }

    if (createdAfter) {
      whereConditions.push(gt(documents.createdAt, createdAfter));
    }

    if (search) {
      whereConditions.push(
        or(
          like(documents.title, `%${search}%`),
          like(documents.description, `%${search}%`),
        )!,
      );
    }

    // Build sort condition
    let sortColumn;

    // Handle column to sort by
    switch (sortBy) {
      case "title":
        sortColumn = documents.title;
        break;
      case "type":
        sortColumn = documents.type;
        break;
      case "createdAt":
      default:
        sortColumn = documents.createdAt;
        break;
    }

    const orderFn = sortOrder === "asc" ? asc : desc;

    // Get total count
    const totalResult = await db
      .select({ total: count() })
      .from(documents)
      .where(and(...whereConditions));

    const total = totalResult[0]?.total ?? 0;

    // If limit is 0, just return the count (used for statistics)
    if (limit === 0) {
      return {
        documents: [],
        total,
      };
    }

    // Get documents with relations
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        type: documents.type,
        visibility: documents.visibility,
        employeeId: documents.employeeId,
        isActive: documents.isActive,
        uploadedBy: documents.uploadedBy,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        employee: {
          id: employees.id,
          designation: employees.designation,
          department: employees.department,
        },
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        attachment: {
          id: attachments.id,
          fullPath: attachments.fullPath,
        },
      })
      .from(documents)
      .leftJoin(employees, eq(documents.employeeId, employees.id))
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .leftJoin(attachments, eq(documents.attachmentId, attachments.id))
      .where(and(...whereConditions))
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return {
      documents: result,
      total,
    };
  }

  static async delete(id: string) {
    const [document] = await db
      .update(documents)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    if (!document) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Document not found",
      });
    }

    return document;
  }

  static async permanentDelete(id: string) {
    const [document] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    return document;
  }

  static async getStats() {
    // Get total count using raw SQL to avoid enum validation issues
    const totalCount = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.isActive, true))
      .then((result) => result[0]?.count ?? 0);

    // Get counts by type using GROUP BY for efficiency
    const typeStats = await db
      .select({
        type: documents.type,
        count: count(),
      })
      .from(documents)
      .where(eq(documents.isActive, true))
      .groupBy(documents.type);

    // Get counts by visibility using GROUP BY for efficiency
    const visibilityStats = await db
      .select({
        visibility: documents.visibility,
        count: count(),
      })
      .from(documents)
      .where(eq(documents.isActive, true))
      .groupBy(documents.visibility);

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUploads = await db
      .select({ count: count() })
      .from(documents)
      .where(
        and(
          eq(documents.isActive, true),
          gt(documents.createdAt, sevenDaysAgo),
        ),
      )
      .then((result) => result[0]?.count ?? 0);

    // Helper function to get count for a specific type
    const getTypeCount = (type: string) =>
      typeStats.find((stat) => stat.type === type)?.count ?? 0;

    // Helper function to get count for a specific visibility
    const getVisibilityCount = (visibility: string) =>
      visibilityStats.find((stat) => stat.visibility === visibility)?.count ??
      0;

    return {
      total: totalCount,
      byType: [
        { type: "policy", count: getTypeCount("policy") },
        { type: "handbook", count: getTypeCount("handbook") },
        { type: "form", count: getTypeCount("form") },
        { type: "contract", count: getTypeCount("contract") },
        { type: "notice", count: getTypeCount("notice") },
        { type: "procedure", count: getTypeCount("procedure") },
        { type: "manual", count: getTypeCount("manual") },
        { type: "other", count: getTypeCount("other") },
      ],
      byVisibility: [
        { visibility: "all", count: getVisibilityCount("all") },
        { visibility: "employees", count: getVisibilityCount("employees") },
        { visibility: "managers", count: getVisibilityCount("managers") },
        { visibility: "hr", count: getVisibilityCount("hr") },
        { visibility: "private", count: getVisibilityCount("private") },
      ],
      recentUploads,
    };
  }
}
