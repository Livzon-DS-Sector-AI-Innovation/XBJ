"""add_attendance_management_tables

Revision ID: 20260623_0001
Revises: a4b465a766ce
Create Date: 2026-06-23 10:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '20260623_0001'
down_revision: Union[str, None] = 'a4b465a766ce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ─── 扩展 hr.departments ───
    op.add_column('departments',
        sa.Column('is_production', sa.Boolean(), nullable=False, server_default='false',
                  comment='是否生产部门'),
        schema='hr')
    op.add_column('departments',
        sa.Column('production_start_time', sa.String(length=8), nullable=True,
                  comment='生产班次开始时间(HH:MM)'),
        schema='hr')
    op.add_column('departments',
        sa.Column('production_end_time', sa.String(length=8), nullable=True,
                  comment='生产班次结束时间(HH:MM)'),
        schema='hr')

    # ─── 扩展 hr.employees ───
    op.add_column('employees',
        sa.Column('position_level', sa.String(length=16), nullable=True,
                  comment='职位级别(自动判定): 普通员工/工程师级/主管级'),
        schema='hr')

    # ─── hr.attendance_calendars ───
    op.create_table('attendance_calendars',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('date', sa.Date(), nullable=False, comment='日期'),
        sa.Column('year', sa.Integer(), nullable=False, comment='年份'),
        sa.Column('month', sa.Integer(), nullable=False, comment='月份'),
        sa.Column('day', sa.Integer(), nullable=False, comment='日'),
        sa.Column('day_of_week', sa.Integer(), nullable=False, comment='星期几 (0=Mon, 6=Sun)'),
        sa.Column('day_type', sa.String(length=16), nullable=False, comment='日期类型: workday/weekend/holiday'),
        sa.Column('holiday_name', sa.String(length=64), nullable=True, comment='节假日名称'),
        sa.Column('is_workday', sa.Boolean(), nullable=False, default=True, comment='是否上班日'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, default=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint('date'),
        schema='hr')
    op.create_index('ix_attendance_calendars_date', 'attendance_calendars', ['date'], unique=True, schema='hr')
    op.create_index('ix_attendance_calendars_year_month', 'attendance_calendars', ['year', 'month'], unique=False, schema='hr')

    # ─── hr.attendance_records ───
    op.create_table('attendance_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('record_date', sa.Date(), nullable=False, comment='考勤日期'),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('hr.employees.id'), nullable=True, comment='员工ID'),
        sa.Column('employee_number', sa.String(length=32), nullable=False, comment='工号'),
        sa.Column('shift', sa.String(length=64), nullable=True, comment='班次'),
        sa.Column('is_abnormal', sa.Boolean(), nullable=False, default=False, comment='是否异常'),
        sa.Column('actual_minutes', sa.Integer(), nullable=True, comment='实际出勤分钟'),
        sa.Column('clock_in', sa.DateTime(), nullable=True, comment='上班打卡时间'),
        sa.Column('clock_out', sa.DateTime(), nullable=True, comment='下班打卡时间'),
        sa.Column('absent_minutes', sa.Integer(), nullable=True, comment='缺勤分钟'),
        sa.Column('absent_days', sa.Float(), nullable=True, comment='旷工天数'),
        sa.Column('late_minutes', sa.Integer(), nullable=True, comment='迟到分钟'),
        sa.Column('late_count', sa.Integer(), nullable=True, comment='迟到次数'),
        sa.Column('early_minutes', sa.Integer(), nullable=True, comment='早退分钟'),
        sa.Column('early_count', sa.Integer(), nullable=True, comment='早退次数'),
        sa.Column('annual_leave_days', sa.Float(), nullable=True, comment='年假（天）'),
        sa.Column('personal_leave', sa.Float(), nullable=True, comment='事假（天/小时）'),
        sa.Column('comp_leave', sa.Float(), nullable=True, comment='调休（天/小时）'),
        sa.Column('sick_leave_days', sa.Float(), nullable=True, comment='病假（天）'),
        sa.Column('marriage_leave_days', sa.Float(), nullable=True, comment='婚假（天）'),
        sa.Column('maternity_leave_days', sa.Float(), nullable=True, comment='产假（天）'),
        sa.Column('funeral_leave_days', sa.Float(), nullable=True, comment='丧假（天）'),
        sa.Column('injury_leave_days', sa.Float(), nullable=True, comment='工伤假（天）'),
        sa.Column('business_trip', sa.Float(), nullable=True, comment='出差（天/小时）'),
        sa.Column('nursing_leave_days', sa.Float(), nullable=True, comment='看护假（天）'),
        sa.Column('training_days', sa.Float(), nullable=True, comment='培训（天）'),
        sa.Column('area', sa.String(length=64), nullable=True, comment='区域'),
        sa.Column('shutdown_comp_leave', sa.Float(), nullable=True, comment='停工调休'),
        sa.Column('source_file', sa.String(length=256), nullable=True, comment='来源文件名'),
        sa.Column('import_batch', sa.String(length=64), nullable=True, comment='导入批次号'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, default=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        schema='hr')
    op.create_index('ix_attendance_records_date', 'attendance_records', ['record_date'], schema='hr')
    op.create_index('ix_attendance_records_employee', 'attendance_records', ['employee_id'], schema='hr')
    op.create_index('ix_attendance_records_employee_number', 'attendance_records', ['employee_number'], schema='hr')
    op.create_index('ix_attendance_records_import_batch', 'attendance_records', ['import_batch'], schema='hr')

    # ─── hr.overtime_records ───
    op.create_table('overtime_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('hr.employees.id'), nullable=True, comment='员工ID'),
        sa.Column('attendance_record_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('hr.attendance_records.id'), nullable=True, comment='关联考勤记录'),
        sa.Column('record_date', sa.Date(), nullable=False, comment='加班日期'),
        sa.Column('overtime_type', sa.String(length=16), nullable=False, comment='weekday/weekend/holiday'),
        sa.Column('overtime_hours', sa.Float(), nullable=False, default=0.0, comment='加班时长（0.5h精度）'),
        sa.Column('conversion_type', sa.String(length=16), nullable=False, comment='comp_leave(调休)/overtime_pay(加班费)'),
        sa.Column('comp_leave_hours', sa.Float(), nullable=True, default=0.0, comment='转调休小时数'),
        sa.Column('overtime_pay', sa.Float(), nullable=True, default=0.0, comment='加班费金额'),
        sa.Column('overtime_rate', sa.Float(), nullable=True, default=10.0, comment='加班费率（元/小时）'),
        sa.Column('calculated_at', sa.DateTime(), nullable=True, comment='计算时间'),
        sa.Column('import_batch', sa.String(length=64), nullable=True, comment='关联导入批次'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, default=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        schema='hr')
    op.create_index('ix_overtime_records_date', 'overtime_records', ['record_date'], schema='hr')
    op.create_index('ix_overtime_records_employee', 'overtime_records', ['employee_id'], schema='hr')
    op.create_index('ix_overtime_records_type', 'overtime_records', ['overtime_type'], schema='hr')
    op.create_index('ix_overtime_records_conversion', 'overtime_records', ['conversion_type'], schema='hr')
    op.create_index('ix_overtime_records_import_batch', 'overtime_records', ['import_batch'], schema='hr')

    # ─── hr.leave_balances ───
    op.create_table('leave_balances',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('hr.employees.id'), nullable=False, comment='员工ID'),
        sa.Column('year', sa.Integer(), nullable=False, comment='年份'),
        sa.Column('leave_type', sa.String(length=16), nullable=False, comment='假期类型: annual/comp/sick'),
        sa.Column('total_days', sa.Float(), nullable=False, default=0.0, comment='总额度'),
        sa.Column('used_days', sa.Float(), nullable=False, default=0.0, comment='已使用'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, default=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint('employee_id', 'year', 'leave_type'),
        schema='hr')
    op.create_index('ix_leave_balances_employee_year_type', 'leave_balances',
                    ['employee_id', 'year', 'leave_type'], unique=True, schema='hr')

    # ─── hr.attendance_import_batches ───
    op.create_table('attendance_import_batches',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('file_name', sa.String(length=256), nullable=False, comment='文件名'),
        sa.Column('file_size', sa.Integer(), nullable=True, comment='文件大小（字节）'),
        sa.Column('record_count', sa.Integer(), nullable=False, default=0, comment='导入记录数'),
        sa.Column('overtime_count', sa.Integer(), nullable=False, default=0, comment='生成的加班记录数'),
        sa.Column('date_range_start', sa.Date(), nullable=True, comment='数据起始日期'),
        sa.Column('date_range_end', sa.Date(), nullable=True, comment='数据截止日期'),
        sa.Column('status', sa.String(length=16), nullable=False, default='pending',
                  server_default='pending', comment='pending/processing/completed/failed'),
        sa.Column('error_message', sa.Text(), nullable=True, comment='错误信息'),
        sa.Column('warnings', postgresql.JSON(), nullable=True, comment='警告列表'),
        sa.Column('imported_by', sa.String(length=64), nullable=True, comment='导入人'),
        sa.Column('imported_at', sa.DateTime(), nullable=True, comment='导入时间'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, default=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        schema='hr')
    op.create_index('ix_attendance_import_batches_status', 'attendance_import_batches', ['status'], schema='hr')

    # ─── hr.attendance_config ───
    op.create_table('attendance_config',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('config_key', sa.String(length=64), nullable=False, comment='配置键'),
        sa.Column('config_value', sa.String(length=256), nullable=False, comment='配置值'),
        sa.Column('description', sa.String(length=256), nullable=True, comment='配置说明'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, default=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint('config_key'),
        schema='hr')
    op.create_index('ix_attendance_config_key', 'attendance_config', ['config_key'], unique=True, schema='hr')

    # ─── 预置配置项 ───
    configs_table = sa.table(
        'attendance_config',
        sa.column('config_key', sa.String),
        sa.column('config_value', sa.String),
        sa.column('description', sa.String),
        schema='hr')
    op.bulk_insert(configs_table, [
        {'config_key': 'overtime_rate', 'config_value': '10.00', 'description': '加班费率（元/小时）'},
        {'config_key': 'standard_start_time', 'config_value': '08:30', 'description': '标准上班时间'},
        {'config_key': 'standard_end_time', 'config_value': '17:00', 'description': '标准下班时间'},
        {'config_key': 'lunch_break_minutes', 'config_value': '60', 'description': '午休分钟数'},
        {'config_key': 'standard_work_minutes', 'config_value': '450', 'description': '标准出勤分钟（8.5h-1h午休=7.5h=450min）'},
        {'config_key': 'position_level_keywords_supervisor',
         'config_value': '主管,经理,主任,科长,部长,厂长,总监,副总',
         'description': '主管级关键词（逗号分隔）'},
        {'config_key': 'position_level_keywords_engineer',
         'config_value': '工程师,技术员,技师,研究员',
         'description': '工程师级关键词（逗号分隔）'},
    ])


def downgrade() -> None:
    op.drop_table('attendance_config', schema='hr')
    op.drop_table('attendance_import_batches', schema='hr')
    op.drop_table('leave_balances', schema='hr')
    op.drop_table('overtime_records', schema='hr')
    op.drop_table('attendance_records', schema='hr')
    op.drop_table('attendance_calendars', schema='hr')

    op.drop_column('employees', 'position_level', schema='hr')
    op.drop_column('departments', 'production_end_time', schema='hr')
    op.drop_column('departments', 'production_start_time', schema='hr')
    op.drop_column('departments', 'is_production', schema='hr')
