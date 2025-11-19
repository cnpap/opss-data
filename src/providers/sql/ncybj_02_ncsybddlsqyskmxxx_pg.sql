CREATE TABLE IF NOT EXISTS ncybj_02_ncsybddlsqyskmxxx_copy1 (
  "jsID" VARCHAR(255) NOT NULL,
  rybh VARCHAR(255),
  ryxm VARCHAR(255),
  zjhm VARCHAR(18) NOT NULL,
  rylb VARCHAR(255),
  dwbh VARCHAR(255),
  dwmc VARCHAR(255),
  ylfze NUMERIC(12, 2),
  jjzfze NUMERIC(12, 2),
  jgmc VARCHAR(255),
  swap_data_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("jsID"),
  CONSTRAINT uk_ncybj_02_zjhm UNIQUE (zjhm, "jsID"),
  CONSTRAINT chk_ncybj_02_zjhm_length CHECK (LENGTH(zjhm) = 18)
);

COMMENT ON TABLE ncybj_02_ncsybddlsqyskmxxx_copy1 IS '南充市医保定点零售药店刷卡明细信息';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1."jsID" IS '结算ID';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.rybh IS '人员编号';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.ryxm IS '人员姓名';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.zjhm IS '身份证件号码';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.rylb IS '类别';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.dwbh IS '单位编号';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.dwmc IS '单位名称';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.ylfze IS '医疗费总额';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.jjzfze IS '基金支付总额';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.jgmc IS '机构名称';
COMMENT ON COLUMN ncybj_02_ncsybddlsqyskmxxx_copy1.swap_data_time IS '更新时间';

-- INSERT INTO ncybj_02_ncsybddlsqyskmxxx_copy1 (
--   "jsID", rybh, ryxm, zjhm, rylb, dwbh, dwmc, ylfze, jjzfze, jgmc, swap_data_time
-- ) VALUES
-- ('511300G0000000278752', '10000000000000000004353105', '李四', '511325199898192929', '在职', '51000051130000000000022616', '西充县人民医院临时人员', 84.00, 0.00, '四川省西充晋龙药业零售连锁有限责任公司第84店', '2023-03-08 09:46:29'),
-- ('511300G0000000142536', '10000000000000000001071763', '张三', '511323198808195155', '在职', '51000051130000000000058919', '蓬安县宏祥劳务有限公司', 87.00, 0.00, '蓬安县众康来大药房', '2023-03-08 09:46:29'),
-- ('511300G0000000725257', '10000000000000000004382459', '王五', '511325199601191626', '在职', '51000051130000000000032612', '西充县中医医院', 256.00, 0.00, '南充市汇通医药零售连锁有限公司西充第76店', '2023-03-08 09:46:29');