import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { workspaceId, role, status, name, avatar } = body;

    let targetUserId = id;
    const memberObj = await prisma.workspaceMember.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });
    if (memberObj) {
      targetUserId = memberObj.userId;
    } else if (id.includes('@')) {
      const u = await prisma.user.findUnique({ where: { email: id.toLowerCase().trim() } });
      if (u) targetUserId = u.id;
    }

    // 1. Update WorkspaceMember role/status
    if (role !== undefined || status !== undefined) {
      await prisma.workspaceMember.updateMany({
        where: {
          OR: [
            { id },
            { userId: targetUserId },
            { userId: id },
          ],
        },
        data: {
          ...(role !== undefined ? { role } : {}),
          ...(status !== undefined ? { status } : {}),
        },
      });
    }

    // 2. Update user profile details
    const userUpdate: any = {};
    if (name !== undefined) userUpdate.name = name;
    if (avatar !== undefined) userUpdate.avatar = avatar;
    if (role !== undefined) userUpdate.role = role;
    if (status !== undefined) userUpdate.status = status;

    let updated = await prisma.user.update({
      where: { id: targetUserId },
      data: userUpdate,
    }).catch(() => null);

    if (!updated && id.includes('@')) {
      updated = await prisma.user.update({
        where: { email: id.toLowerCase().trim() },
        data: userUpdate,
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    // If workspaceId is provided, remove only from that workspace
    if (workspaceId) {
      await prisma.workspaceMember.deleteMany({
        where: {
          OR: [
            { id },
            { userId: id, workspaceId },
          ],
        },
      });
      return NextResponse.json({ success: true, message: 'User removed from workspace' });
    }

    // Otherwise remove membership by member id or fallback user delete
    const deletedMember = await prisma.workspaceMember.deleteMany({
      where: { id },
    });

    if (deletedMember.count === 0) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'User removed' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
