using FluentMigrator;

namespace TrainPass.Data.Migrations
{
    [Migration(06062026)]
    public class InitialCreate : Migration
    {
        public override void Up()
        {
            Create.Table("customers")
                .WithColumn("id").AsString().PrimaryKey()
                .WithColumn("firstName").AsString().NotNullable()
                .WithColumn("lastName").AsString().NotNullable()
                .WithColumn("email").AsString().NotNullable()
                .WithColumn("role").AsString().Nullable()
                .WithColumn("passwordHash").AsString().Nullable()
                .WithColumn("passwordSalt").AsString().Nullable()
                .WithColumn("createdAt").AsDateTime().NotNullable();

            Create.Table("admins")
                .WithColumn("id").AsString().PrimaryKey()
                .WithColumn("firstName").AsString().NotNullable()
                .WithColumn("lastName").AsString().NotNullable()
                .WithColumn("email").AsString().NotNullable()
                .WithColumn("passwordHash").AsString().Nullable()
                .WithColumn("passwordSalt").AsString().Nullable()
                .WithColumn("createdAt").AsDateTime().NotNullable();

            Create.Table("trains")
                .WithColumn("id").AsInt32().PrimaryKey().Identity()
                .WithColumn("name").AsString().NotNullable()
                .WithColumn("trainNumber").AsString().NotNullable()
                .WithColumn("totalSeats").AsInt32().NotNullable();

            Create.Table("stations")
                .WithColumn("id").AsInt32().PrimaryKey().Identity()
                .WithColumn("name").AsString().NotNullable()
                .WithColumn("city").AsString().NotNullable();

            Create.Table("trainSchedules")
                .WithColumn("id").AsInt32().PrimaryKey().Identity()
                .WithColumn("trainId").AsInt32().NotNullable()
                .WithColumn("departureStationId").AsInt32().NotNullable()
                .WithColumn("arrivalStationId").AsInt32().NotNullable()
                .WithColumn("departureTime").AsDateTime().NotNullable()
                .WithColumn("arrivalTime").AsDateTime().NotNullable()
                .WithColumn("price").AsDecimal().NotNullable();

            Create.Table("tickets")
                .WithColumn("id").AsInt32().PrimaryKey().Identity()
                .WithColumn("customerId").AsString().NotNullable()
                .WithColumn("trainScheduleId").AsInt32().NotNullable()
                .WithColumn("seatNumber").AsInt32().NotNullable()
                .WithColumn("purchaseDate").AsDateTime().NotNullable()
                .WithColumn("status").AsString().NotNullable();

        }

        public override void Down()
        {
            Delete.Table("tickets");
            Delete.Table("trainSchedules");
            Delete.Table("stations");
            Delete.Table("trains");
            Delete.Table("admins");
            Delete.Table("customers");

        }
    }
}
