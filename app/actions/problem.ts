'use server';

import { db } from '@/db';
import { problems, testCases } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

async function generateShortLink(id: number, customSlug?: string | null) {
  const shortlinkBaseUrl = process.env.SHORTLINK_URL || 'http://localhost:3001';
  const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const longUrl = `${appBaseUrl}/problem/${id}`;

  try {
    const response = await fetch(`${shortlinkBaseUrl}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: customSlug || undefined, // If undefined, service generates random 4-char slug
        long_url: longUrl 
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.short_url; // Service returns the full short URL
    }
    console.error('Failed to create internal shortlink:', await response.text());
    return null;
  } catch (error) {
    console.error('Error calling shortlink service:', error);
    return null;
  }
}

export async function getProblems() {
  return await db.select().from(problems).where(eq(problems.isPublic, true)).orderBy(problems.createdAt);
}

export async function getAllProblemsAdmin() {
  return await db.select().from(problems).orderBy(problems.createdAt);
}

export async function getProblemById(id: number) {
  const result = await db.select().from(problems).where(eq(problems.id, id));
  if (result.length === 0) return null;
  
  const problemTestCases = await db.select().from(testCases).where(eq(testCases.problemId, id));
  
  return {
    ...result[0],
    testCases: problemTestCases,
  };
}

export interface TestCaseInput {
  testScript: string;
  expectedOutput?: string; // only for 'bebas' type
}

export interface ProblemInput {
  title: string;
  description: string;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  timingMode: 'scheduled' | 'manual';
  isPublic?: boolean;
  // SkemaSoal
  solutionType: 'function' | 'class' | 'bebas';
  functionName?: string | null;
  className?: string | null;
  shortLink?: string | null;
  testCases: TestCaseInput[];
}

export async function createProblem(data: ProblemInput) {
  try {
    const [result] = await db.insert(problems).values({
      title: data.title,
      description: data.description,
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      duration: data.duration,
      timingMode: data.timingMode,
      isPublic: data.isPublic ?? true,
      solutionType: data.solutionType,
      functionName: data.functionName || null,
      className: data.className || null,
    });
    
    const insertedId = (result as any).insertId;

    // Generate random short link
    try {
      const shortLink = await generateShortLink(insertedId); // No slug passed = random
      if (shortLink) {
        await db.update(problems).set({ shortLink }).where(eq(problems.id, insertedId));
      }
    } catch (err) {
      console.error('Error generating short link after insert:', err);
    }
    
    if (data.testCases && data.testCases.length > 0) {
      await db.insert(testCases).values(
        data.testCases.map(tc => ({
          problemId: insertedId,
          testScript: tc.testScript,
          expectedOutput: tc.expectedOutput || null,
          // legacy fields kept as null for new records
          type: data.solutionType === 'bebas' ? 'standard' : 'script',
          input: null,
        }))
      );
    }
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true, id: insertedId };
  } catch (error) {
    console.error('Failed to create problem:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function updateProblem(id: number, data: ProblemInput) {
  try {
    let finalShortLink = data.shortLink;

    if (finalShortLink && finalShortLink.trim() !== "") {
      // If manually updated/provided, sync it to the shortlink-service
      try {
        // Extract slug: can be full URL or just the slug
        const slug = finalShortLink.split('/').pop();
        if (slug) {
          const syncedUrl = await generateShortLink(id, slug);
          if (syncedUrl) {
            finalShortLink = syncedUrl;
          }
        }
      } catch (err) {
        console.error('Error syncing manual short link:', err);
      }
    } else {
      // If no short link provided in data, check existing or generate
      const [existing] = await db.select({ shortLink: problems.shortLink }).from(problems).where(eq(problems.id, id));
      finalShortLink = existing?.shortLink;

      if (!finalShortLink) {
        try {
          finalShortLink = await generateShortLink(id);
        } catch (err) {
          console.error('Error generating random short link during update:', err);
        }
      }
    }

    await db.update(problems).set({
      title: data.title,
      description: data.description,
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      duration: data.duration,
      timingMode: data.timingMode,
      isPublic: data.isPublic ?? true,
      solutionType: data.solutionType,
      functionName: data.functionName || null,
      className: data.className || null,
      shortLink: finalShortLink || null,
    }).where(eq(problems.id, id));
    
    // Replace test cases: delete then re-insert
    await db.delete(testCases).where(eq(testCases.problemId, id));
    
    if (data.testCases && data.testCases.length > 0) {
      await db.insert(testCases).values(
        data.testCases.map(tc => ({
          problemId: id,
          testScript: tc.testScript,
          expectedOutput: tc.expectedOutput || null,
          type: data.solutionType === 'bebas' ? 'standard' : 'script',
          input: null,
        }))
      );
    }
    
    revalidatePath('/admin/dashboard');
    revalidatePath(`/problem/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update problem:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function startProblemManual(id: number) {
  try {
    await db.update(problems).set({
      startTime: new Date(),
    }).where(eq(problems.id, id));
    
    revalidatePath('/admin/dashboard');
    revalidatePath(`/problem/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to start problem:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getProblemStatus(id: number) {
  const result = await db.select({ startTime: problems.startTime }).from(problems).where(eq(problems.id, id));
  if (result.length === 0) return null;
  return result[0];
}

export async function resetProblemManual(id: number) {
  try {
    await db.update(problems).set({
      startTime: null,
    }).where(eq(problems.id, id));
    
    revalidatePath('/admin/dashboard');
    revalidatePath(`/problem/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to reset problem:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function deleteProblem(id: number) {
  try {
    await db.delete(problems).where(eq(problems.id, id));
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete problem:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
