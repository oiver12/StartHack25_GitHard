FROM quay.io/jupyter/pyspark-notebook:spark-3.5.3
RUN pip install delta-sharing findspark
RUN echo 'import findspark' > /home/jovyan/session.py \
    && echo 'findspark.init()' >> /home/jovyan/session.py \
    && echo 'from pyspark.sql import SparkSession' >> /home/jovyan/session.py \
    && echo 'spark = SparkSession.builder.appName("resolve-delta-sharing-spark").config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension").config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog").config("spark.jars.packages", "io.delta:delta-sharing-spark_2.12:3.3.0").getOrCreate()' >> /home/jovyan/session.py \
    && /opt/conda/bin/python session.py \
    && rm session.py
