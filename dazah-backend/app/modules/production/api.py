from uuid import UUID

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import paginated_response, success_response
from app.modules.production.schemas import (
    MaterialBomCreate,
    MaterialBomResponse,
    MaterialBomUpdate,
)
from app.modules.production.service import MaterialBomService
from app.shared.module_api import create_module_router
from app.shared.module_registry import MODULES_BY_CODE
from app.shared.schemas import PageParams

router = create_module_router(MODULES_BY_CODE["production"])


def get_material_bom_service(
    session: AsyncSession = Depends(get_db),
) -> MaterialBomService:
    return MaterialBomService(session)


# ─── Material Bom Routes ───

@router.get("/material-boms", summary="物料清单列表")
async def list_material_boms(
    keyword: str | None = Query(None, description="物料名称、代号、生产商或工艺名称关键词"),
    page_params: PageParams = Depends(),
    service: MaterialBomService = Depends(get_material_bom_service),
):
    boms, total = await service.list_material_boms(
        keyword=keyword,
        page=page_params.page,
        page_size=page_params.page_size,
    )
    data = [
        MaterialBomResponse.model_validate(b).model_dump(mode="json")
        for b in boms
    ]
    return paginated_response(
        data=data,
        page=page_params.page,
        page_size=page_params.page_size,
        total=total,
    )


@router.post("/material-boms", summary="创建物料清单")
async def create_material_bom(
    payload: MaterialBomCreate,
    service: MaterialBomService = Depends(get_material_bom_service),
):
    bom = await service.create_material_bom(payload)
    return success_response(
        data=MaterialBomResponse.model_validate(bom).model_dump(mode="json"),
        message="物料清单创建成功",
        status_code=201,
    )


@router.get("/material-boms/{bom_id}", summary="物料清单详情")
async def get_material_bom(
    bom_id: UUID,
    service: MaterialBomService = Depends(get_material_bom_service),
):
    bom = await service.get_material_bom(bom_id)
    return success_response(
        data=MaterialBomResponse.model_validate(bom).model_dump(mode="json"),
    )


@router.put("/material-boms/{bom_id}", summary="更新物料清单")
async def update_material_bom(
    bom_id: UUID,
    payload: MaterialBomUpdate,
    service: MaterialBomService = Depends(get_material_bom_service),
):
    bom = await service.update_material_bom(bom_id, payload)
    return success_response(
        data=MaterialBomResponse.model_validate(bom).model_dump(mode="json"),
        message="物料清单更新成功",
    )


@router.delete("/material-boms/{bom_id}", summary="删除物料清单")
async def delete_material_bom(
    bom_id: UUID,
    service: MaterialBomService = Depends(get_material_bom_service),
):
    await service.delete_material_bom(bom_id)
    return success_response(message="物料清单删除成功")


@router.post("/material-boms/sync-from-feishu", summary="从飞书多维表格同步物料清单数据")
async def sync_material_boms_from_feishu(
    service: MaterialBomService = Depends(get_material_bom_service),
):
    """手动触发：从飞书多维表格拉取全部物料清单数据并 upsert 到本地 PG。"""
    stats = await service.sync_from_feishu()
    msg = (
        f"同步完成：新增 {stats['created']} 条，"
        f"更新 {stats['updated']} 条，失败 {stats['failed']} 条"
    )
    if stats.get("errors"):
        msg += f" | 错误: {'; '.join(stats['errors'][:3])}"
    return success_response(
        data=stats,
        message=msg,
    )


@router.get("/material-boms/sync-status", summary="飞书同步状态")
async def get_material_bom_sync_status(
    service: MaterialBomService = Depends(get_material_bom_service),
):
    """查看本地与飞书的数据同步统计。"""
    status = await service.get_sync_status()
    return success_response(
        data=status.model_dump(mode="json"),
    )


@router.post("/material-boms/{bom_id}/sync-to-feishu", summary="同步单个物料清单到飞书")
async def sync_material_bom_to_feishu(
    bom_id: UUID,
    service: MaterialBomService = Depends(get_material_bom_service),
):
    """将本地单个物料清单强制同步到飞书多维表格。"""
    record_id = await service.sync_to_feishu(bom_id)
    return success_response(
        data={"feishu_record_id": record_id},
        message="物料清单已同步到飞书",
    )
